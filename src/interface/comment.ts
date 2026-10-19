import type { ApiResponse } from "./ApiResponse"
import type { User } from "./user"

export interface Comment {
  _id: string
  content: string
  commentCreator: User
  post: string
  parentComment?: Comment | string | null
  image?: string
  likes: string[]
  createdAt: string
}


export interface Comments{
  data: Comment[]
}

export type CommentResponse = ApiResponse<Comments>
