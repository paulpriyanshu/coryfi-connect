'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, MessageCircle, ArrowLeft, Briefcase, GraduationCap, MapPin, LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { RatingModal } from '@/components/ui/sections/RatingModal'
import { PostModal } from '@/components/ui/sections/PostModal'
import toast, { Toaster } from 'react-hot-toast'
import { connect_users, check_connection } from "@/app/api/actions/network"
import { fetchPosts, fetchUserData } from '@/app/api/actions/media'

export default function EnhancedUserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'Connect' | 'Connected' | 'Connecting'>('Connect')
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const id = Number(userId)
        const userPosts = await fetchPosts(id)
        console.log("this is posts", userPosts.posts)
        setPosts(userPosts.posts)
      } catch (error) {
        console.error("Error fetching posts:", error)
        toast.error("Failed to load user posts")
      }
    }
    fetchUserPosts()
  }, [userId])

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        const id = Number(userId)
        const userData = await fetchUserData(id)
        setUser(userData)
        if (session?.user?.email && userData.email) {
          const connectionExists = await check_connection(session.user.email, userData.email)
          setIsConnected(connectionExists)
          setConnectionStatus(connectionExists ? 'Connected' : 'Connect')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setError('Failed to load user profile. Please try again later.')
        toast.error('Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, session])

  const handleConnectClick = () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to connect with other users")
      return
    }
    if (!isConnected) {
      setIsRatingModalOpen(true)
    }
  }

  const handleRatingSubmit = async (rating: number) => {
    if (!session?.user?.email || !user?.email) {
      toast.error("Unable to establish connection. Please try again.")
      return
    }

    setConnectionStatus('Connecting')
    console.log("emails",session.user.email,user.email,rating)
    const connectPromise = connect_users(session.user.email, user.email,rating)
    
    toast.promise(
      connectPromise,
      {
        loading: 'Connecting...',
        success: (data) => {
          setConnectionStatus('Connected')
          setIsConnected(true)
          return `You've successfully connected with ${user.name}!`
        },
        error: (err) => {
          setConnectionStatus('Connect')
          return "Unable to establish connection. Please try again."
        },
      }
    )

    try {
      await connectPromise
      // Here you can also save the rating to your backend
      // await saveRating(session.user.email, user.email, rating)
    } catch (error) {
      console.error("Error connecting users:", error)
    }
  }

  const handleFindPath = () => {
    router.push('/')
    toast.success('Redirecting to Find Path...')
  }

  const handlePostClick = (post) => {
    const enhancedPost = {
      ...post,
      comments: post.comments || [],
    }
    console.log("enhanced",enhancedPost)
    setSelectedPost(enhancedPost)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      <Link href="/network" className="flex items-center text-blue-500 hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Network
      </Link>

      <Card className="w-full overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600">
          {user.banner && (
            <Image src={user.banner} alt="Profile banner" layout="fill" objectFit="cover" />
          )}
        </div>
        <CardHeader className="relative pb-0">
          <Avatar className="w-24 h-24 absolute -top-12 ring-4 ring-background">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="mt-12 flex justify-between items-end">
            <div>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              {user.currentPosition && user.company && (
                <p className="text-xl text-muted-foreground">
                  {user.currentPosition} at {user.company}
                </p>
              )}
              <div className="flex items-center text-muted-foreground mt-2">
                {user.location && (
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.connections !== undefined && (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span>{user.connections} connections</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                className="bg-white hover:bg-blue-100 text-black transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleFindPath}
                disabled={connectionStatus === 'Connecting' || isConnected}
              >
                <img src='/icon.png' className="mr-2 h-6 w-6" />
                Find Path
              </Button>
              <Button 
                className={`transition-all duration-300 ease-in-out transform hover:scale-105
                  ${isConnected 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-white hover:bg-blue-600 text-black hover:text-white'}`}
                onClick={handleConnectClick}
                disabled={connectionStatus === 'Connecting' || isConnected}
              >
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                className="transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              {user.bio && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Bio</h3>
                    <p>{user.bio}</p>
                  </CardContent>
                </Card>
              )}
              {user.website && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Website</h3>
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {user.website}
                    </a>
                  </CardContent>
                </Card>
              )}
              {user.skills && user.skills.length > 0 && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="experience">
              {user.experience && user.experience.length > 0 ? (
                user.experience.map((exp, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <Briefcase className="mr-4 h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.duration}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No experience information available.</p>
              )}
            </TabsContent>
            <TabsContent value="education">
              {user.education && user.education.length > 0 ? (
                user.education.map((edu, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <GraduationCap className="mr-4 h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold">{edu.school}</h3>
                          <p className="text-muted-foreground">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.year}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No education information available.</p>
              )}
            </TabsContent>
            <TabsContent value="posts">
              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post, index) => (
                    <Card key={index} className="overflow-hidden cursor-pointer" onClick={() => handlePostClick(post)}>
                      <CardContent className="p-4">
                        {post?.imageUrl && post.imageUrl.length > 0 && (
                          <div className="mb-4">
                            <img
                              src={post.imageUrl[0]} 
                              alt="Post image" 
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                        {post?.content && <p className="mb-4 line-clamp-3">{post.content}</p>}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div>
                            <span className="mr-4">{post.likes} likes</span>
                            <span>{post.comments?.length || 0} comments</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>No posts available.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />

      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          userId={Number(userId)}
        />
      )}
    </div>
  )
}

