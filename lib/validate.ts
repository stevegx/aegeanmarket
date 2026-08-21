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

export const adminUpdateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(3, 'Address must be at least 3 characters long'),
  phone: z
    .string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .startsWith('69', 'Phone number must start with 69'),
  role: z.enum(['customer', 'admin']),
  isActive: z.boolean(),
})

export const adminCreateUserSchema = adminUpdateUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const adminOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const adminUpdateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['paid', 'unpaid', 'refunded']),
  shippingAddress: shippingAddressSchema,
  items: z.array(adminOrderItemSchema).min(1, 'Order must have at least one item'),
})

export const adminCreateOrderSchema = z
  .object({
    customerType: z.enum(['registered', 'guest']),
    userId: z.string().optional(),
    guestName: z.string().min(3, 'Guest name is required').optional(),
    guestEmail: z.string().email('Invalid email address').optional(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    paymentMethod: z.enum(['credit_card', 'iris', 'paypal', 'klarna', 'cod']),
    paymentStatus: z.enum(['paid', 'unpaid', 'refunded']),
    shippingAddress: shippingAddressSchema,
    items: z.array(adminOrderItemSchema).min(1, 'Order must have at least one item'),
  })
  .refine(
    (data) =>
      data.customerType === 'registered'
        ? !!data.userId
        : !!data.guestName && !!data.guestEmail,
    {
      message: 'Select a customer, or provide a guest name and email',
      path: ['userId'],
    }
  )

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type CartData = z.infer<typeof CartSchema>
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type ReplyFormData = z.infer<typeof replySchema>
export type AdminUpdateOrderData = z.infer<typeof adminUpdateOrderSchema>
export type AdminCreateOrderData = z.infer<typeof adminCreateOrderSchema>
export type AdminUpdateUserData = z.infer<typeof adminUpdateUserSchema>
export type AdminCreateUserData = z.infer<typeof adminCreateUserSchema>
