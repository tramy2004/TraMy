<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserBehavior;
use App\Models\Product;
use Illuminate\Support\Facades\Http;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $apiKey = env('GEMINI_API_KEY');
        $model = env('GEMINI_MODEL', 'gemini-1.5-flash-latest');

        // 1. Lấy top 15 hành vi gần đây nhất của User để phân tích đa chiều
        $behaviors = UserBehavior::where('user_id', $user->id)
            ->latest()
            ->limit(15)
            ->get();

        // Nếu user mới tinh, chưa có hành vi gì $\rightarrow$ Gợi ý ngẫu nhiên/mới nhất
        if ($behaviors->isEmpty()) {
            return Product::inRandomOrder()->limit(10)->get();
        }

        // Mảng lưu trữ các vector mục tiêu thu được từ hành vi của khách
        $targetEmbeddings = [];

        foreach ($behaviors as $behavior) {
            // Trọng số mặc định cho hành vi xem sản phẩm (view)
            $weight = 1.0; 

            // Nếu bỏ vào giỏ hàng mà chưa thanh toán, nhân đôi trọng số để xuất hiện nhiều hơn
            if ($behavior->type === 'add_to_cart') {
                $weight = 2.5; 
            }

            // Trường hợp 1: Hành vi gắn liền với một sản phẩm cụ thể (view, add_to_cart)
            if ($behavior->product_id) {
                $product = Product::find($behavior->product_id);
                if ($product && $product->embedding) {
                    // Giải mã nếu fen lưu dạng JSON/Array trong DB
                    $embedding = is_string($product->embedding) ? json_decode($product->embedding, true) : $product->embedding;
                    
                    if (is_array($embedding)) {
                        $targetEmbeddings[] = [
                            'vector' => $embedding,
                            'weight' => $weight
                        ];
                    }
                }
            } 
            // Trường hợp 2: Hành vi tìm kiếm bằng từ khóa (search) -> Dùng Gemini đẻ ra Vector
            elseif ($behavior->type === 'search' && !empty($behavior->search_query) && $apiKey) {
                try {
                    // Gọi API Gemini để lấy embedding của từ khóa tìm kiếm
                    $response = Http::withHeaders(['Content-Type' => 'application/json'])
                        ->post("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={$apiKey}", [
                            'content' => [
                                'parts' => [
                                    ['text' => $behavior->search_query]
                                ]
                            ]
                        ]);

                    if ($response->successful()) {
                        $vector = $response->json('embedding.values');
                        if (is_array($vector)) {
                            $targetEmbeddings[] = [
                                'vector' => $vector,
                                'weight' => 1.8 // Trọng số ưu tiên cao cho từ khóa chủ động tìm kiếm
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error("Lỗi gọi Gemini Embedding: " . $e->getMessage());
                }
            }
        }

        // Nếu rốt cuộc không trích xuất được vector nào, trả về random tránh crash trang
        if (empty($targetEmbeddings)) {
            return Product::inRandomOrder()->limit(10)->get();
        }

        // 2. Lấy tất cả các sản phẩm có sẵn trong kho để chấm điểm độ tương đồng
        // Tiện tay gọi luôn quan hệ 'variants' để ngoài React map ra card không bị lỗi
        $allProducts = Product::with('variants')->whereNotNull('embedding')->get();
        $scores = [];

        // Gom danh sách ID các sản phẩm user vừa tương tác để lát nữa không gợi ý trùng lặp y hệt
        $interactedProductIds = $behaviors->pluck('product_id')->filter()->unique()->toArray();

        foreach ($allProducts as $p) {
            // Bỏ qua chính những sản phẩm khách vừa xem xong (Xem rồi thì gợi ý cái khác tương tự)
            if (in_array($p->id, $interactedProductIds)) {
                continue;
            }

            $pEmbedding = is_string($p->embedding) ? json_decode($p->embedding, true) : $p->embedding;
            if (!is_array($pEmbedding)) continue;

            $maxSimilarity = 0;

            // So sánh sản phẩm này với TẤT CẢ các sản phẩm/từ khóa trong lịch sử của User
            foreach ($targetEmbeddings as $target) {
                $similarity = $this->cosineSimilarity($target['vector'], $pEmbedding);
                
                // Áp trọng số (Vừa tính toán ở bước trên) vào điểm số tương đồng
                $weightedSimilarity = $similarity * $target['weight'];

                if ($weightedSimilarity > $maxSimilarity) {
                    $maxSimilarity = $weightedSimilarity;
                }
            }

            $scores[] = [
                'product' => $p,
                'score' => $maxSimilarity
            ];
        }

        // 3. Sắp xếp điểm số từ cao xuống thấp
        usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);

        // Trả về top 10 sản phẩm thông minh nhất
        return collect($scores)
            ->take(10)
            ->pluck('product')
            ->values();
    }

    /**
     * Hàm tính Cosine Similarity giữa 2 vector
     */
    private function cosineSimilarity(array $vec1, array $vec2)
    {
        $dotProduct = 0;
        $numA = 0;
        $numB = 0;

        $count = min(count($vec1), count($vec2));
        for ($i = 0; $i < $count; $i++) {
            $dotProduct += $vec1[$i] * $vec2[$i];
            $numA += $vec1[$i] * $vec1[$i];
            $numB += $vec2[$i] * $vec2[$i];
        }

        if ($numA == 0 || $numB == 0) return 0;

        return $dotProduct / (sqrt($numA) * sqrt($numB));
    }
}