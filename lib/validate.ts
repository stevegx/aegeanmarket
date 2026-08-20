import * as z from 'zod'

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
    address: z.string().min(3, 'Address must be at least 3 characters long'),
    phone: z
      .string()
      .length(10, 'Phone number must be exactly 10 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits')
      .startsWith('69', 'Phone number must start with 69'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  loginCredentials: z
    .string()
    .min(3, 'Username or email must be at least 3 characters long'),
  password: z.string().min(0, 'Password is Empty!!'),
})

export const CartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const shippingAddressSchema = z.object({
  street: z.string().min(2, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  city: z.string().min(2, 'City is required'),
  zipcode: z.string().min(3, 'Zipcode is required'),
  country: z.string().min(2, 'Country is required'),
})

export const checkoutSchema = z.object({
  guestName: z
    .string()
    .min(3, 'Full name must be at least 3 characters long')
    .optional(),
  guestEmail: z.string().email('Invalid email address').optional(),
  street: z.string().min(2, 'Street is required'),
  number: z.string().min(1, 'Number is required'),
  city: z.string().min(2, 'City is required'),
  zipcode: z.string().min(3, 'Zipcode is required'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['credit_card', 'iris', 'paypal', 'klarna', 'cod']),
})

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(3, 'Address must be at least 3 characters long'),
  phone: z
    .string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .startsWith('69', 'Phone number must start with 69'),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating is required').max(5),
  text: z
    .string()
    .trim()
    .min(1, 'Review text is required')
    .max(1000, 'Review must be at most 1000 characters'),
})

export const replySchema = z.object({
  text: z
    .string()
    .min(1, 'Reply text is required')
    .max(1000, 'Reply must be at most 1000 characters'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type CartData = z.infer<typeof CartSchema>
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type ReplyFormData = z.infer<typeof replySchema>
