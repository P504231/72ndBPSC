// File: src/api/youtube.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeClient = axios.create({
  baseURL: BASE_URL,
  params: { key: API_KEY },
});

// Fetch playlist metadata (title, thumbnail, description)
export const fetchPlaylistInfo = async (playlistId) => {
  try {
    const { data } = await youtubeClient.get('/playlists', {
      params: {
        part: 'snippet',
        id: playlistId,
      },
    });
    if (!data.items || data.items.length === 0) {
      throw new Error('Playlist not found');
    }
    return data.items[0].snippet;
  } catch (error) {
    console.error('Failed to fetch playlist info:', error.response?.data?.error?.message || error.message);
    throw new Error('Failed to load playlist info.');
  }
};

// Fetch playlist videos with stats
export const fetchPlaylistItems = async (playlistId, pageToken = '', { signal } = {}) => {
  try {
    // 1. Fetch playlist items
    const playlistResponse = await youtubeClient.get('/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 20,
        pageToken,
      },
      signal,
    });

    const videoIds = playlistResponse.data.items
      .map((item) => item.contentDetails.videoId)
      .join(',');

    if (!videoIds) {
      return { items: [], nextPageToken: null, totalResults: 0 };
    }

    // 2. Fetch detailed video stats
    const statsResponse = await youtubeClient.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
      },
      signal,
    });

    return {
      items: statsResponse.data.items,
      nextPageToken: playlistResponse.data.nextPageToken,
      totalResults: playlistResponse.data.pageInfo.totalResults,
    };
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    console.error('YouTube API Error:', error.response?.data?.error?.message || error.message);
    throw new Error('Failed to fetch playlist data. Please check your API key and quota.');
  }
};