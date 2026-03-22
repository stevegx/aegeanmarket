import * as z from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    address: z.string().min(3, "Address must be at least 3 characters long"),
    phone: z.string().length(10, "Phone number must be exactly 10 digits")
             .regex(/^\d+$/, "Phone number must contain only digits")
             .startsWith("69", "Phone number must start with 69"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export type RegisterFormData = z.infer<typeof registerSchema>;