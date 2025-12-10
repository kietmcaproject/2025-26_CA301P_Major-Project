import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, AcademicCapIcon, CodeBracketIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const userId = localStorage.getItem('email')
  const [profileData, setProfileData] = useState({
    name: '',
    email:userId,
    username: '',
    dob: '',
    gender: '',
    college: '',
    country: '',
    bio: '',
    image: '',
    problemSolved: '',
    linkedIn: '',
    github: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`);
      const data = await response.json();
      if (data.userProfile) {
        setProfileData(prev => ({
          ...prev,
          ...data.userProfile,
        }));
      } else {
        toast.error('Profile not found.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/update/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    setLoading(true);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        handleInputChange('image', data.secure_url);
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      toast.error('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              
              {/* Profile Picture */}
              <div className="relative -mt-16 sm:-mt-20">
                <div className="relative">
                  {profileData.image ? (
                    <img
                      src={profileData.image}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </label>
                  )}
                </div>
              </div>
              
              {/* Name and Basic Info */}
              <div className="mt-4 sm:mt-0 flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-600 outline-none w-full"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      value={userId}
                      className="text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-600 outline-none"
                      readOnly
                      placeholder="@email"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {profileData.name || 'Add your name'}
                    </h1>
                    <p className="text-lg text-gray-600 mb-1">
                      {profileData.email || 'username'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Edit Button */}
              <div className="mt-4 sm:mt-0">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {profileData.bio || 'No bio available. Click edit to add your bio.'}
                </p>
              )}
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not specified'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {isEditing ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    ) : (
                      <span className="text-gray-600">
                        {profileData.gender || 'Not specified'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your country"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {profileData.country || 'Not specified'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.college}
                        onChange={(e) => handleInputChange('college', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your institution"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {profileData.college || 'Not specified'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Coding Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CodeBracketIcon className="w-5 h-5 mr-2" />
                Coding Stats
              </h2>
              <div className="text-center">
                {
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {profileData.problemSolved || '0'}
                  </div>
                }
                <p className="text-gray-600">Problems Solved</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Links</h2>
              <div className="space-y-4">
                
                {/* GitHub */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://github.com/yourusername"
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">GitHub</p>
                        {profileData.github ? (
                          <a
                            href={profileData.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {profileData.github}
                          </a>
                        ) : (
                          <p className="text-gray-500 text-sm">Not provided</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.linkedIn}
                        onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        {profileData.linkedIn ? (
                          <a
                            href={profileData.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {profileData.linkedIn}
                          </a>
                        ) : (
                          <p className="text-gray-500 text-sm">Not provided</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
