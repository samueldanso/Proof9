export interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  duration: string;
  plays: number;
  verified: boolean;
  imageUrl?: string;
  audioUrl?: string;
  isLiked?: boolean;
  likes: number;
  comments: number;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  createdAt?: string;
  license?: {
    type: string;
    price: string;
    available: boolean;
    terms: string;
    downloads: number;
  };
}
