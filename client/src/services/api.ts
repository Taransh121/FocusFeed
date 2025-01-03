export const fetchArticles = async (query: string) => {
    const response = await fetch(`http://localhost:8080/api/scrape?query=${query}`); // Adjust URL to match your backend
    if (!response.ok) {
      throw new Error(`Failed to fetch articles for ${query}`);
    }
    return response.json().then((res) => res.data);
  };
  
  // Fetch both Trump and Biden articles
  export const fetchTrumpAndBidenArticles = async () => {
    const [trumpArticles, bidenArticles] = await Promise.all([
      fetchArticles('trump'),
      fetchArticles('biden'),
    ]);
  
    return {
      trump: trumpArticles,
      biden: bidenArticles,
    };
  };
  export const fetchTweets=async(query:string)=>{
    const response = await fetch(`http://localhost:8080/api/scrapeTwitter?search?q=${query}`); // Adjust URL to match your backend
    if (!response.ok) {
      throw new Error(`Failed to fetch articles for ${query}`);
    }
    return response.json().then((res) => res.data);
  }
  export const fetchTrumpAndBidenTweets=async()=>{
    const [trumpTweets, bidenTweets] = await Promise.all([
        fetchTweets('trump'),
        fetchTweets('biden'),
      ]);
    
      return {
        trump: trumpTweets,
        biden: bidenTweets,
      };
  }