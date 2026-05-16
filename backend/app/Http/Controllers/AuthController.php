<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    //  REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    //  LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Sai email hoặc mật khẩu']
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    //  LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    //  PROFILE
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    //  UPDATE PROFILE (Đã nâng cấp cấu trúc địa chỉ mới)
    public function updateProfile(Request $request)
    {
        $user = $request->user(); // Lấy user đang đăng nhập từ token

        // Validate chặt chẽ từng trường địa chỉ
        $data = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'phone'          => 'nullable|string|max:20',
            
            // Thay thế 'address' cũ bằng 3 trường mới
            'address_detail' => 'nullable|string|max:255', // Số nhà, tên đường
            'ward'           => 'nullable|string|max:100', // Xã / Phường
            'province'       => 'nullable|string|max:100', // Tỉnh / Thành phố
        ]);

        // Laravel Eloquent sẽ tự động đối chiếu các key trong $data với $fillable của User để cập nhật
        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thông tin trang cá nhân thành công!',
            'user'    => $user
        ]);
    }
}