import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@repo/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { sileo } from "@/components/DynamicIslandToast";
import { useCallback } from "react";

export const useUserProfile = () => {
  const { user, refetch, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await userApi.updateUser(updatedData);
      if (res.statusCode !== 200 && res.statusCode !== 201) {
        throw new Error(res.message || "Failed to update profile");
      }
      return res.data;
    },
    onSuccess: () => {
      sileo.success({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được cập nhật.",
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      refetch();
    },
    onError: (err: any) => {
      sileo.error({
        title: "Cập nhật thất bại",
        description: err.message || "Có lỗi xảy ra khi lưu thông tin.",
      });
    }
  });

  return {
    user,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    refresh: useCallback(async () => {
      await Promise.all([
        refetch(),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    }, [refetch]),
  };
};
