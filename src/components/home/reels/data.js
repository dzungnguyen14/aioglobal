export const SAMPLE_REELS = [
  {
    id: '1',
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: {
      id: 'u1',
      name: 'AIO Global',
      username: '@aioglobal',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isFollowing: false,
    },
    caption: 'Welcome to AIO Reels! Amazing moments captured every day ✨ #aioglobal #reels',
    likes: 12400,
    shares: 320,
    isLiked: false,
    comments: [
      { id: 'c1', userId: 'u2', name: 'Sophie Tran', avatar: 'https://i.pravatar.cc/150?img=5', text: 'This is absolutely stunning! 😍', likes: 24, time: '2h ago' },
      { id: 'c2', userId: 'u3', name: 'Minh Hoang', avatar: 'https://i.pravatar.cc/150?img=8', text: 'Love the content, keep it up! 🔥', likes: 18, time: '3h ago' },
      { id: 'c3', userId: 'u4', name: 'Lan Pham', avatar: 'https://i.pravatar.cc/150?img=9', text: 'First comment! So proud to be part of AIO 🌟', likes: 42, time: '4h ago' },
      { id: 'c4', userId: 'u5', name: 'David Lee', avatar: 'https://i.pravatar.cc/150?img=12', text: 'Can\'t stop watching this on repeat 😂', likes: 7, time: '5h ago' },
      { id: 'c5', userId: 'u6', name: 'Anna Nguyen', avatar: 'https://i.pravatar.cc/150?img=16', text: 'The quality is insane! What camera did you use?', likes: 11, time: '6h ago' },
    ],
  },
  {
    id: '2',
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: {
      id: 'u2',
      name: 'Sophie Tran',
      username: '@sophietran',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isFollowing: true,
    },
    caption: 'Dream big, work hard 💪 Every step counts on this journey #motivation #lifestyle',
    likes: 8750,
    shares: 215,
    isLiked: true,
    comments: [
      { id: 'c1', userId: 'u1', name: 'AIO Global', avatar: 'https://i.pravatar.cc/150?img=1', text: 'Such an inspiring video! 👏', likes: 56, time: '1h ago' },
      { id: 'c2', userId: 'u7', name: 'Kevin Do', avatar: 'https://i.pravatar.cc/150?img=20', text: 'This motivated me so much today, thank you!', likes: 33, time: '2h ago' },
      { id: 'c3', userId: 'u8', name: 'Mai Le', avatar: 'https://i.pravatar.cc/150?img=23', text: 'Following for more content like this 🙌', likes: 15, time: '3h ago' },
      { id: 'c4', userId: 'u9', name: 'Tommy Vu', avatar: 'https://i.pravatar.cc/150?img=25', text: 'Exactly what I needed to hear today 💯', likes: 28, time: '4h ago' },
    ],
  },
  {
    id: '3',
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: {
      id: 'u3',
      name: 'Minh Hoang',
      username: '@minhhoang',
      avatar: 'https://i.pravatar.cc/150?img=8',
      isFollowing: false,
    },
    caption: 'Behind the scenes of our latest project 🎬 #behindthescenes #creative #team',
    likes: 5200,
    shares: 89,
    isLiked: false,
    comments: [
      { id: 'c1', userId: 'u10', name: 'Hoa Nguyen', avatar: 'https://i.pravatar.cc/150?img=30', text: 'The teamwork here is incredible! 🤝', likes: 19, time: '30m ago' },
      { id: 'c2', userId: 'u11', name: 'Bao Tran', avatar: 'https://i.pravatar.cc/150?img=33', text: 'I want to join your team!! How to apply? 👀', likes: 8, time: '1h ago' },
      { id: 'c3', userId: 'u12', name: 'Chloe Pham', avatar: 'https://i.pravatar.cc/150?img=35', text: 'This is what passion looks like 🔥', likes: 45, time: '2h ago' },
    ],
  },
  {
    id: '4',
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    user: {
      id: 'u4',
      name: 'Lan Pham',
      username: '@lanpham',
      avatar: 'https://i.pravatar.cc/150?img=9',
      isFollowing: true,
    },
    caption: 'Exploring the world one city at a time 🌍 Travel is the best education ✈️ #travel #explore',
    likes: 21300,
    shares: 640,
    isLiked: false,
    comments: [
      { id: 'c1', userId: 'u13', name: 'Jason Vo', avatar: 'https://i.pravatar.cc/150?img=40', text: 'This place looks magical! Where is this? 😲', likes: 102, time: '5m ago' },
      { id: 'c2', userId: 'u14', name: 'Linda Dang', avatar: 'https://i.pravatar.cc/150?img=44', text: 'Adding this to my bucket list immediately!', likes: 67, time: '20m ago' },
      { id: 'c3', userId: 'u15', name: 'Nam Truong', avatar: 'https://i.pravatar.cc/150?img=47', text: 'Your travel content is always top tier 🌟', likes: 38, time: '45m ago' },
      { id: 'c4', userId: 'u16', name: 'Uyen Le', avatar: 'https://i.pravatar.cc/150?img=50', text: 'I need a vacation after watching this 😭', likes: 21, time: '1h ago' },
      { id: 'c5', userId: 'u17', name: 'Phong Nguyen', avatar: 'https://i.pravatar.cc/150?img=52', text: 'Life goals right here 🙏', likes: 14, time: '2h ago' },
    ],
  },
  {
    id: '5',
    videoUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    user: {
      id: 'u5',
      name: 'David Lee',
      username: '@davidlee',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isFollowing: false,
    },
    caption: 'When the weekend hits just right 😄 Enjoy every moment with your crew! #fun #weekend #vibes',
    likes: 9870,
    shares: 178,
    isLiked: true,
    comments: [
      { id: 'c1', userId: 'u18', name: 'Tina Ho', avatar: 'https://i.pravatar.cc/150?img=60', text: 'This made my whole day better 😂❤️', likes: 73, time: '10m ago' },
      { id: 'c2', userId: 'u19', name: 'Peter Nguyen', avatar: 'https://i.pravatar.cc/150?img=63', text: 'The energy in this video is unmatched!!', likes: 44, time: '30m ago' },
      { id: 'c3', userId: 'u20', name: 'Jenny Tran', avatar: 'https://i.pravatar.cc/150?img=65', text: 'I laughed so hard 🤣🤣🤣', likes: 29, time: '1h ago' },
    ],
  },
];

export const formatCount = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
};
