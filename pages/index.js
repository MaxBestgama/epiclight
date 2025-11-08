export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Game ID is required'
    });
  }

  try {
    // Fetch game details from Steam Store API
    const gameResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}`
    );
    const gameData = await gameResponse.json();

    if (!gameData[id] || !gameData[id].success) {
      return res.status(404).json({
        success: false,
        error: 'Game not found or invalid Steam ID'
      });
    }

    const game = gameData[id].data;

    // Extract DLC information
    let dlcs = [];
    if (game.dlc) {
      // Fetch DLC details
      const dlcIds = game.dlc.join(',');
      const dlcResponse = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${dlcIds}`
      );
      const dlcData = await dlcResponse.json();
      
      dlcs = game.dlc.map(dlcId => {
        const dlc = dlcData[dlcId];
        return {
          id: dlcId,
          name: dlc?.success ? dlc.data.name : `DLC ${dlcId}`,
          success: dlc?.success || false
        };
      });
    }

    // Extract media information
    const media = {
      screenshots: game.screenshots || [],
      videos: game.movies || []
    };

    // Format response
    const responseData = {
      steam_appid: game.steam_appid,
      name: game.name,
      header_image: game.header_image,
      release_date: game.release_date,
      developers: game.developers,
      publishers: game.publishers,
      price_overview: game.price_overview,
      detailed_description: game.detailed_description,
      short_description: game.short_description,
      media: media,
      dlcs: dlcs,
      categories: game.categories,
      genres: game.genres,
      platforms: game.platforms
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching Steam data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
