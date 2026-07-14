import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export const fetchPlaylistInfo = async (playlistId) => {
  try {
    const response = await youtubeClient.get('/playlists', {
      params: {
        part: 'snippet',
        id: playlistId,
      },
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      throw new Error(`Playlist not found: ${playlistId}`);
    }

    return items[0].snippet;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    console.error('fetchPlaylistInfo Error:', message);
    throw new Error(message);
  }
};

export const fetchPlaylistItems = async (playlistId, pageToken = '') => {
  try {
    const playlistResponse = await youtubeClient.get('/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 20,
        pageToken,
      },
    });

    const videoIds = playlistResponse.data.items
      .map((item) => item.contentDetails.videoId)
      .join(',');

    if (!videoIds) {
      return { items: [], nextPageToken: null, totalResults: 0 };
    }

    const statsResponse = await youtubeClient.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
      },
    });

    return {
      items: statsResponse.data.items,
      nextPageToken: playlistResponse.data.nextPageToken || null,
      totalResults: playlistResponse.data.pageInfo?.totalResults || 0,
    };
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    console.error('fetchPlaylistItems Error:', message);
    throw new Error(message);
  }
};