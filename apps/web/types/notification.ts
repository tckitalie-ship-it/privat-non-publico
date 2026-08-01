export interface Notification {
  id: string;
  title: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}