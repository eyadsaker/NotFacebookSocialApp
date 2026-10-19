import type { ApiResponse } from "./ApiResponse"
import type { User } from "./user"
import type { Comment } from "./comment"

export interface Post {
  _id: string
  body?: string
  privacy: "public"| "friends" 
  user: User
  sharedPost?: Post | null
  likes: string[]
  createdAt: string
  commentsCount: number
  topComment?: Comment
  sharesCount: number
  likesCount: number
  isShare: boolean
  id: string
  bookmarked: boolean
  image?: string
}

export interface Posts {
  posts: Post[]
}


export type PostResponse = ApiResponse<Posts>
