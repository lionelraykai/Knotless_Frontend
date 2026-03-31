import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// Fetch current user profile
const fetchProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

// Update user profile
const updateProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Also update the local user object if needed
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...savedUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
  });
};
