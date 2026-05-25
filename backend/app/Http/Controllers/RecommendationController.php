<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserBehavior;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache; // 🔥 Import thêm Cache để tối ưu API

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $apiKey = env('GEMINI_API_KEY');

        // 1. Lấy top 15 hành vi gần đây nhất
        $behaviors = UserBehavior::where('user_id', $user->id)
            ->latest()
            ->limit(15)
            ->get();

        // 🔥 FIX 1: DẸP BỎ RANDOM. Trả về 10 sản phẩm MỚI NHẤT nếu user chưa có hành vi
        if ($behaviors->isEmpty()) {
            return Product::with(['variants', 'images', 'category'])
                ->latest()
                ->limit(10)
                ->get();
        }

        $targetEmbeddings = [];
        $weightDecay = 1.0; // Biến suy giảm trọng số: Hành vi càng cũ, trọng số càng giảm

        foreach ($behaviors as $behavior) {
            // Định hình trọng số theo mức độ quan trọng của hành vi
            $baseWeight = 1.0; // Mặc định cho 'view'
            if ($behavior->type === 'add_to_cart') {
                $baseWeight = 3.0; // Bỏ giỏ hàng là cực kỳ quan trọng
            } elseif ($behavior->type === 'search') {
                $baseWeight = 2.0; // Tìm kiếm có chủ đích cũng rất quan trọng
            }

            // Trọng số cuối cùng = Trọng số hành vi * Trọng số thời gian
            $finalWeight = $baseWeight * $weightDecay;

            // TRƯỜNG HỢP 1: Tương tác trực tiếp với sản phẩm
            if ($behavior->product_id) {
                $product = Product::find($behavior->product_id);
                if ($product && $product->embedding) {
                    $embedding = is_string($product->embedding) ? json_decode($product->embedding, true) : $product->embedding;
                    
                    if (is_array($embedding)) {
                        $targetEmbeddings[] = [
                            'vector' => $embedding,
                            'weight' => $finalWeight
                        ];
                    }
                }
            } 
            // TRƯỜNG HỢP 2: Lịch sử tìm kiếm
            elseif ($behavior->type === 'search' && !empty($behavior->search_query) && $apiKey) {
                try {
                    // 🔥 FIX 2: SỬ DỤNG CACHE ĐỂ KHÔNG GỌI API GEMINI LIÊN TỤC
                    $cacheKey = 'gemini_embed_' . md5($behavior->search_query);
                    
                    $vector = Cache::remember($cacheKey, 86400, function () use ($apiKey, $behavior) {
                        $response = Http::withHeaders(['Content-Type' => 'application/json'])
                            ->post("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={$apiKey}", [
                                'content' => [
                                    'parts' => [['text' => $behavior->search_query]]
                                ]
                            ]);

                        if ($response->successful()) {
                            return $response->json('embedding.values');
                        }
                        return null;
                    });

                    if (is_array($vector)) {
                        $targetEmbeddings[] = [
                            'vector' => $vector,
                            'weight' => $finalWeight 
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error("Lỗi gọi Gemini Embedding: " . $e->getMessage());
                }
            }

            // Giảm nhẹ trọng số cho các vòng lặp sau (hành vi cũ hơn)
            $weightDecay -= 0.05; 
            if ($weightDecay < 0.5) $weightDecay = 0.5; // Không cho giảm quá 0.5
        }

        // 🔥 FIX 1 (tt): Fallback ổn định nếu rốt cuộc không trích xuất được vector nào
        if (empty($targetEmbeddings)) {
            return Product::with(['variants', 'images', 'category'])
                ->latest()
                ->limit(10)
                ->get();
        }

        // 2. Chấm điểm độ tương đồng
        // 🔥 FIX 3: Luôn load kèm variants, images, category để React hiển thị không bị lỗi
        $allProducts = Product::with(['variants', 'images', 'category'])
            ->whereNotNull('embedding')
            ->get();
            
        $scores = [];
        $interactedProductIds = $behaviors->pluck('product_id')->filter()->unique()->toArray();

        foreach ($allProducts as $p) {
            // Không gợi ý lại những sản phẩm khách đã xem rồi
            if (in_array($p->id, $interactedProductIds)) {
                continue;
            }

            $pEmbedding = is_string($p->embedding) ? json_decode($p->embedding, true) : $p->embedding;
            if (!is_array($pEmbedding)) continue;

            $maxSimilarity = 0;

            foreach ($targetEmbeddings as $target) {
                $similarity = $this->cosineSimilarity($target['vector'], $pEmbedding);
                
                // Điểm = Tương đồng * Trọng số
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

        // Trả về top 10 sản phẩm AI thấy phù hợp nhất
        return collect($scores)
            ->take(10)
            ->pluck('product')
            ->values();
    }

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