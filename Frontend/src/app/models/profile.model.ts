export interface Profile {
  id: number;
  user: number;
  name: string;
  email: string;
  photo_url: string | null;
  bio: string;
  city: string;
  gender: 'M' | 'F' | 'O' | '';
  gender_display: string;
  birthdate: string | null;
  created_at: string;
  updated_at: string;
  additional_photos?: ProfilePhoto[];
}

export interface ProfilePhoto {
  id: number;
  url: string;
  uploaded_at: string;
}
