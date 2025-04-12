import { supabase } from './supabase';

export interface SavedSearch {
  id: string;
  user_id: string;
  query: string;
  answer: string;
  created_at: string;
  helpful_results: FeedbackItem[];
}

export interface FeedbackItem {
  id: string;
  search_id: string;
  item_id: string;
  item_type: 'answer' | 'result';
  is_helpful: boolean;
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

// Save a search query and its answer
export async function saveSearch(userId: string, query: string, answer: string) {
  try {
    // This is a placeholder implementation
    console.log('Saving search:', { userId, query, answer });
    
    // In a real implementation, we would:
    // const { data, error } = await supabase
    //   .from('searches')
    //   .insert({
    //     user_id: userId,
    //     query,
    //     answer,
    //   })
    //   .select()
    //   .single();
    
    // if (error) throw error;
    // return data;
    
    // For now, return mock data
    return {
      id: `search-${Date.now()}`,
      user_id: userId,
      query,
      answer,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving search:', error);
    throw error;
  }
}

// Save feedback for a search answer or result
export async function saveFeedback(
  userId: string, 
  searchId: string, 
  itemId: string,
  itemType: 'answer' | 'result',
  isHelpful: boolean
) {
  try {
    // This is a placeholder implementation
    console.log('Saving feedback:', { userId, searchId, itemId, itemType, isHelpful });
    
    // In a real implementation, we would:
    // const { data, error } = await supabase
    //   .from('search_feedback')
    //   .insert({
    //     user_id: userId,
    //     search_id: searchId,
    //     item_id: itemId,
    //     item_type: itemType,
    //     is_helpful: isHelpful,
    //   })
    //   .select()
    //   .single();
    
    // if (error) throw error;
    // return data;
    
    // For now, return mock data
    return {
      id: `feedback-${Date.now()}`,
      user_id: userId,
      search_id: searchId,
      item_id: itemId,
      item_type: itemType,
      is_helpful: isHelpful,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
}

// Get user's search history
export async function getUserSearchHistory(userId: string) {
  try {
    // This is a placeholder implementation
    console.log('Getting search history for user:', userId);
    
    // In a real implementation, we would:
    // const { data, error } = await supabase
    //   .from('searches')
    //   .select('*, search_feedback(*)')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });
    
    // if (error) throw error;
    // return data;
    
    // For now, return mock data
    return [
      {
        id: '1',
        user_id: userId,
        query: 'What is ServiceNow?',
        answer: 'ServiceNow is a cloud-based platform that provides IT service management (ITSM), IT operations management (ITOM), and IT business management (ITBM) tools.',
        created_at: '2023-12-15T14:30:00Z',
        helpful_results: [
          {
            id: '101',
            search_id: '1',
            item_id: 'answer',
            item_type: 'answer',
            is_helpful: true,
            created_at: '2023-12-15T14:35:00Z',
          }
        ]
      },
      {
        id: '2',
        user_id: userId,
        query: 'How to create a workflow in ServiceNow?',
        answer: 'To create a workflow in ServiceNow, go to Workflow > Workflow Editor, click "New" to create a workflow, design your workflow using the graphical editor, and then publish it.',
        created_at: '2023-12-10T10:15:00Z',
        helpful_results: []
      },
      {
        id: '3',
        user_id: userId,
        query: 'ServiceNow REST API documentation',
        answer: 'ServiceNow REST API documentation can be found at https://developer.servicenow.com/dev.do#!/reference/api/sandiego/rest. It provides comprehensive guides on all REST endpoints, authentication methods, and examples.',
        created_at: '2023-12-05T16:45:00Z',
        helpful_results: [
          {
            id: '102',
            search_id: '3',
            item_id: 'result-1',
            item_type: 'result',
            is_helpful: true,
            created_at: '2023-12-05T16:50:00Z',
          },
          {
            id: '103',
            search_id: '3',
            item_id: 'answer',
            item_type: 'answer',
            is_helpful: true,
            created_at: '2023-12-05T16:52:00Z',
          }
        ]
      },
    ] as SavedSearch[];
  } catch (error) {
    console.error('Error getting search history:', error);
    throw error;
  }
}

// Get saved searches marked as helpful
export async function getHelpfulSearches(userId: string) {
  try {
    // This is a placeholder implementation
    console.log('Getting helpful searches for user:', userId);
    
    // In a real implementation, we would:
    // const { data, error } = await supabase
    //   .from('search_feedback')
    //   .select('*, searches(*)')
    //   .eq('user_id', userId)
    //   .eq('is_helpful', true)
    //   .order('created_at', { ascending: false });
    
    // if (error) throw error;
    // return data;
    
    // For now, return the mock data filtered for helpful items
    const history = await getUserSearchHistory(userId);
    return history.filter(search => search.helpful_results.length > 0);
  } catch (error) {
    console.error('Error getting helpful searches:', error);
    throw error;
  }
} 