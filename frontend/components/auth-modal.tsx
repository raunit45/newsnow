"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EyeIcon, EyeOffIcon } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onLogin: (displayName: string) => void
  onSwitchMode: (mode: "login" | "signup") => void
}

export default function AuthModal({ isOpen, onClose, mode, onLogin, onSwitchMode }: AuthModalProps) {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mode === "signup") {
      if (!formData.fullname.trim()) newErrors.fullname = "Full name is required"
      if (!formData.role) newErrors.role = "Role is required"
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const endpoint = mode === "login" ? "signin" : "signup"
      const payload =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : {
              fullname: formData.fullname,
              email: formData.email,
              role: formData.role,
              password: formData.password,
            }

      const response = await fetch(`http://localhost:8080/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.text()

      if (result && result.length > 20) {
        // Success - token received
        localStorage.setItem("authToken", result)
        localStorage.setItem("userEmail", formData.email)

        // Fetch profile to get fullname
        let displayName = formData.email
        try {
          const profileResp = await fetch(
            `http://localhost:8080/users/profile?email=${encodeURIComponent(formData.email)}`,
            { headers: { Authorization: `Bearer ${result}` } },
          )
          if (profileResp.ok) {
            const profile = await profileResp.json()
            if (profile?.fullname) {
              displayName = profile.fullname
              localStorage.setItem("userFullname", profile.fullname)
            }
          }
        } catch {}

        onLogin(displayName)
        setFormData({
          fullname: "",
          email: "",
          role: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        // Handle error response
        const parts = result.split("::")
        const code = parts[0]
        const message = parts.slice(1).join("::") || "Authentication failed"

        if (code === "200" && mode === "signup") {
          alert("Registration successful! Please sign in.")
          onSwitchMode("login")
        } else {
          alert(message)
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === "login" ? "Sign In to NewsNow" : "Join NewsNow"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="fullname" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  className={`bg-slate-700 border-slate-600 text-white ${errors.fullname ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.fullname && <p className="text-red-400 text-sm mt-1">{errors.fullname}</p>}
              </div>

              <div>
                <Label htmlFor="role" className="text-gray-300">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger
                    className={`bg-slate-700 border-slate-600 text-white ${errors.role ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="READER">Reader</SelectItem>
                    <SelectItem value="JOURNALIST">Journalist</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`bg-slate-700 border-slate-600 text-white ${errors.email ? "border-red-500" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`bg-slate-700 border-slate-600 text-white pr-10 ${errors.password ? "border-red-500" : ""}`}
                placeholder="Enter your password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          {mode === "signup" && (
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
                <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`bg-slate-700 border-slate-600 text-white pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => onSwitchMode(mode === "login" ? "signup" : "login")}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
