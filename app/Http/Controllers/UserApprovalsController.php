<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserApprovalsController extends Controller
{
    /**
     * Display all user approvals with status.
     */
    public function index()
    {
        $allUsers = User::whereNotNull('approval_status')
            ->with(['shopProfile', 'distributorProfile'])
            ->orderByRaw("CASE approval_status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 END")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'approval_status' => $user->approval_status,
                    'created_at' => $user->created_at->diffForHumans(),
                    'profile' => $user->role === 'retailer' ? $user->shopProfile : $user->distributorProfile,
                ];
            });

        $pendingUsers = $allUsers->where('approval_status', 'pending')->values();
        $approvedUsers = $allUsers->where('approval_status', 'approved')->values();
        $rejectedUsers = $allUsers->where('approval_status', 'rejected')->values();

        $stats = [
            'total_users' => (int) User::whereNotNull('approval_status')->count(),
            'pending_users' => (int) User::where('approval_status', 'pending')->count(),
            'approved_users' => (int) User::where('approval_status', 'approved')->count(),
            'rejected_users' => (int) User::where('approval_status', 'rejected')->count(),
        ];

        return Inertia::render('dashboard/user-approvals', [
            'pendingUsers' => $pendingUsers,
            'approvedUsers' => $approvedUsers,
            'rejectedUsers' => $rejectedUsers,
            'allUsers' => $allUsers,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a pending user.
     */
    public function approve(User $user)
    {
        if ($user->approval_status !== 'pending') {
            return back()->with('error', 'User is not pending approval.');
        }

        $user->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'User approved successfully.');
    }

    /**
     * Reject a pending user.
     */
    public function reject(User $user)
    {
        if ($user->approval_status !== 'pending') {
            return back()->with('error', 'User is not pending approval.');
        }

        $user->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'User rejected successfully.');
    }
}
