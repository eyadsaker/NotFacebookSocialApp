export interface User {
  _id: string
  name: string
  username: string
  photo: string
  cover?: string
  email?: string
  dateOfBirth?: string
  gender?: string
  followersCount?: number
  followingCount?: number
  isFollowing?: boolean
}
