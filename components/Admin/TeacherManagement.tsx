// components/teacher-management.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Users, Search, Edit, Trash2, Mail, Phone } from "lucide-react"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  department: string
  designation: string
  subjects: string[]
  joinDate: string
  status: "active" | "inactive"
}

// Mock data
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@college.edu",
    phone: "+1 (555) 123-4567",
    employeeId: "EMP001",
    department: "Computer Science",
    designation: "Professor",
    subjects: ["Data Structures", "Algorithms", "Database Systems"],
    joinDate: "2020-08-15",
    status: "active",
  },
  {
    id: "2",
    name: "Prof. Michael Brown",
    email: "michael.brown@college.edu",
    phone: "+1 (555) 234-5678",
    employeeId: "EMP002",
    department: "Mathematics",
    designation: "Associate Professor",
    subjects: ["Calculus", "Linear Algebra", "Statistics"],
    joinDate: "2019-01-10",
    status: "active",
  },
  {
    id: "3",
    name: "Dr. Emily Chen",
    email: "emily.chen@college.edu",
    phone: "+1 (555) 345-6789",
    employeeId: "EMP003",
    department: "Physics",
    designation: "Assistant Professor",
    subjects: ["Quantum Physics", "Thermodynamics"],
    joinDate: "2021-09-01",
    status: "active",
  },
  {
    id: "4",
    name: "Prof. James Rodriguez",
    email: "james.rodriguez@college.edu",
    phone: "+1 (555) 456-7890",
    employeeId: "EMP004",
    department: "Chemistry",
    designation: "Professor",
    subjects: ["Organic Chemistry", "Biochemistry"],
    joinDate: "2018-03-20",
    status: "active",
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    email: "lisa.thompson@college.edu",
    phone: "+1 (555) 567-8901",
    employeeId: "EMP005",
    department: "Biology",
    designation: "Associate Professor",
    subjects: ["Molecular Biology", "Genetics"],
    joinDate: "2020-02-14",
    status: "active",
  },
  {
    id: "6",
    name: "Mr. Robert Johnson",
    email: "robert.johnson@college.edu",
    phone: "+1 (555) 678-9012",
    employeeId: "EMP006",
    department: "English",
    designation: "Lecturer",
    subjects: ["Literature", "Creative Writing"],
    joinDate: "2022-05-30",
    status: "active",
  },
]

const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English"]
const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Assistant"]

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    subjects: [],
    status: "active",
  })
  const [error, setError] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesDepartment = selectedDepartment === "all" || teacher.department === selectedDepartment
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDepartment && matchesSearch
  })

  const handleAddTeacher = () => {
    // Validation
    if (!newTeacher.name || !newTeacher.email || !newTeacher.employeeId || !newTeacher.department) {
      setError("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newTeacher.email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsAdding(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      const teacherToAdd: Teacher = {
        id: `t${teachers.length + 1}`,
        name: newTeacher.name!,
        email: newTeacher.email!,
        phone: newTeacher.phone || "",
        employeeId: newTeacher.employeeId!,
        department: newTeacher.department!,
        designation: newTeacher.designation || "Lecturer",
        subjects: newTeacher.subjects || [],
        joinDate: new Date().toISOString().split('T')[0],
        status: "active",
      }

      setTeachers([...teachers, teacherToAdd])
      setNewTeacher({
        name: "",
        email: "",
        phone: "",
        employeeId: "",
        department: "",
        designation: "",
        subjects: [],
        status: "active",
      })
      setShowAddForm(false)
      setIsAdding(false)
    }, 500)
  }

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter(teacher => teacher.id !== id))
    }
  }

  const getDepartmentStats = () => {
    const stats: Record<string, number> = {}
    teachers.forEach((teacher) => {
      stats[teacher.department] = (stats[teacher.department] || 0) + 1
    })
    return stats
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Teacher Management</h2>
          <p className="text-muted-foreground">Manage faculty members and staff across departments</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 whitespace-nowrap">
          <UserPlus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teachers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedDepartment !== "all" 
                  ? "No teachers match your search criteria" 
                  : "Get started by adding a new teacher"}
              </p>
              {(!searchTerm && selectedDepartment === "all") && (
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{teacher.name}</CardTitle>
                        <CardDescription>{teacher.designation}</CardDescription>
                      </div>
                      <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                        {teacher.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{teacher.employeeId}</Badge>
                        <span className="text-muted-foreground">{teacher.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(getDepartmentStats()).map(([dept, count]) => (
              <Card key={dept} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{dept}</CardTitle>
                  <CardDescription>Faculty Members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{count}</span>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {Object.keys(getDepartmentStats()).length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No department data</h3>
                <p className="text-muted-foreground">Add teachers to see department statistics</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>Enter teacher details to add them to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newTeacher.name || ""}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="Enter teacher's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={newTeacher.employeeId || ""}
                    onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email || ""}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newTeacher.phone || ""}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={newTeacher.department || ""}
                    onValueChange={(value) => setNewTeacher({ ...newTeacher, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    value={newTeacher.designation || ""}
                    onValueChange={(value) => setNewTeacher({ ...newTeacher, designation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((designation) => (
                        <SelectItem key={designation} value={designation}>
                          {designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleAddTeacher} 
                  className="flex-1"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Teacher"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setError("")
                  }}
                  className="flex-1"
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}