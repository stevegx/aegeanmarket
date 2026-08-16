export interface ReviewUser {
  _id: string
  username: string
}

export interface ReviewData {
  _id: string
  user: ReviewUser
  parent: string | null
  mentionedUser: ReviewUser | null
  rating: number | null
  text: string
  createdAt: string
  likes: string[]
}
