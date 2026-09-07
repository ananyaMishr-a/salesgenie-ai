import { apiClient } from './client.js'

/**
 * Attempts to log in against the real backend. Resolves with the user on
 * success, throws an Error with a display-ready `.message` on failure —
 * LoginPage catches this and shows err.message directly.
 *
 * Expected backend response shape: { email, name, role, token }
 * (adjust the destructuring below if the backend's /auth/login returns
 * different field names once it's implemented).
 */
export async function loginRequest({ email, password }) {
  try {
    const data = await apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    })

    if (data?.token) {
      localStorage.setItem('salesgenie_token', data.token)
    }

    return {
      email: data.email,
      name: data.name,
      role: data.role,
    }
  } catch (err) {
    const status = err?.response?.status
    if (status === 401 || status === 400) {
      throw new Error('Incorrect email or password.')
    }
    if (!err?.response) {
      throw new Error('Could not reach the server. Is the backend running?')
    }
    throw new Error(err?.response?.data?.detail || 'Login failed. Please try again.')
  }
}

export async function requestOtpRequest({ name, email, password }) {
  try {
    const data = await apiClient.post(`/auth/request-otp`, {
      name: name?.trim() || 'New User',
      email: email.trim().toLowerCase(),
      password,
    })
    return data
  } catch (err) {
    const status = err?.response?.status
    if (status === 400) {
      throw new Error(err?.response?.data?.detail || 'An account with this email already exists.')
    }
    if (!err?.response) {
      throw new Error('Could not reach the server. Is the backend running?')
    }
    throw new Error(err?.response?.data?.detail || 'Sign up failed. Please try again.')
  }
}

export async function verifyOtpRequest({ email, otpCode }) {
  try {
    const data = await apiClient.post(`/auth/verify-otp`, {
      email: email.trim().toLowerCase(),
      otp_code: otpCode,
    })

    if (data?.token) {
      localStorage.setItem('salesgenie_token', data.token)
    }

    return {
      email: data.email,
      name: data.name,
      role: data.role,
    }
  } catch (err) {
    if (!err?.response) {
      throw new Error('Could not reach the server. Is the backend running?')
    }
    throw new Error(err?.response?.data?.detail || 'Invalid OTP code. Please try again.')
  }
}

export async function updateProfileRequest({ name }) {
  try {
    const data = await apiClient.put(`/auth/me/profile`, { name })
    return data
  } catch (err) {
    throw new Error(err?.response?.data?.detail || 'Failed to update profile.')
  }
}

export async function updatePasswordRequest({ old_password, new_password }) {
  try {
    const data = await apiClient.put(`/auth/me/password`, { old_password, new_password })
    return data
  } catch (err) {
    throw new Error(err?.response?.data?.detail || 'Failed to update password.')
  }
}

export async function requestDeleteOtpRequest({ email, password }) {
  try {
    const data = await apiClient.post(`/auth/me/delete-otp`, { email, password })
    return data
  } catch (err) {
    throw new Error(err?.response?.data?.detail || 'Failed to send OTP.')
  }
}

export async function deleteAccountRequest({ email, password, otp_code, reason }) {
  try {
    const data = await apiClient.post(`/auth/me/delete`, { email, password, otp_code, reason })
    return data
  } catch (err) {
    throw new Error(err?.response?.data?.detail || 'Failed to delete account.')
  }
}