export interface User {
  id: number;
  name: string;
  age: number;
  city: string;
  photoUrl: string;
  bio: string;
  gender?: string;
  interests?: string[];
  likedByMe?: boolean;
}

export interface RegisterDto {
  name: string;
  age: number;
  city: string;
  photoUrl: string;
  bio: string;
  gender: string;
  interests: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FriendRequest {
  id: number;
  fromUser: User;   // NOT optional — fixes NG8107 warnings
  toUser: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
