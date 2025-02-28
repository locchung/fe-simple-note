import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import { callApi } from '../services/api'
export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    userName: formData.get('userName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Call API to create user
  const userData = {
    username: formData.get('userName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const result = await callApi('/auth/signup', 'POST', '', userData)

  return {
    message: result.message,
    code: result.statusCode,
  }
}
