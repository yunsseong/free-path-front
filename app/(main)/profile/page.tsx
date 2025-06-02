"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, User } from "lucide-react"

// Sample user data - in a real app this would come from authentication context
const currentUser = {
  name: "Admin User",
  email: "admin@bfmap.com",
  avatar: "/placeholder.svg?height=80&width=80",
  role: "Administrator",
  bio: "Accessibility specialist and BFMap administrator with 5 years of experience in creating barrier-free environments.",
  phone: "+1 (555) 123-4567",
  department: "Accessibility Services",
  joinDate: "January 2020",
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    bio: currentUser.bio,
    phone: currentUser.phone,
  })

  const handleSave = () => {
    // In a real app, this would make an API call to update the user profile
    console.log("Saving profile data:", formData)
    setIsEditing(false)
    // Show success message
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      bio: currentUser.bio,
      phone: currentUser.phone,
    })
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge variant="secondary">{currentUser.role}</Badge>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Department</p>
                <p className="text-muted-foreground">{currentUser.department}</p>
              </div>
              <div>
                <p className="font-medium">Joined</p>
                <p className="text-muted-foreground">{currentUser.joinDate}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Change Avatar
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </div>
              {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Your recent activity and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Maps Created</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">145</div>
              <div className="text-sm text-muted-foreground">Buildings Added</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">324</div>
              <div className="text-sm text-muted-foreground">POIs Created</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">Reports Reviewed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
