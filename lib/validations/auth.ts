import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上である必要があります")
    .regex(/[A-Z]/, "パスワードには大文字を含める必要があります")
    .regex(/[a-z]/, "パスワードには小文字を含める必要があります")
    .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
  companyName: z.string().min(1, "会社名を入力してください"),
  name: z.string().min(1, "名前を入力してください"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意してください",
  }),
})

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
  rememberMe: z.boolean().optional(),
})

export const passwordResetSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
})

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "トークンが必要です"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上である必要があります")
    .regex(/[A-Z]/, "パスワードには大文字を含める必要があります")
    .regex(/[a-z]/, "パスワードには小文字を含める必要があります")
    .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>
