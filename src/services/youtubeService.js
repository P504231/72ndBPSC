import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export const getPlaylistVideos = async (playlistId, pageToken = '') => {
  try {
    // 1. Fetch playlist items
    const playlistResponse = await youtubeClient.get('/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 20,
        pageToken: pageToken,
      },
    });

    const videoIds = playlistResponse.data.items
      .map((item) => item.contentDetails.videoId)
      .join(',');

    // 2. Fetch detailed video stats (duration, views, etc.)
    const statsResponse = await youtubeClient.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
      },
    });

    return {
      items: statsResponse.data.items,
      nextPageToken: playlistResponse.data.nextPageToken,
      totalResults: playlistResponse.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data?.error?.message || error.message);
    throw new Error('Failed to fetch playlist data. Please check your API key and quota.');
  }
};