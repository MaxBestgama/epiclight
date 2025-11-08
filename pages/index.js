import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '@components/Header'
import Footer from '@components/Footer'

// API configuration (for display purposes only)
const apiConfig = {
  "api_list": [
    {
      "name": "TwentyTwo Cloud",
      "url": "http://masss.pythonanywhere.com/storage?auth=IEOIJE54esfsipoE56GE4&appid=<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Sadie",
      "url": "https://mellyiscoolaf.pythonanywhere.com/m/<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Ryuu",
      "url": "https://mellyiscoolaf.pythonanywhere.com/<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Sushi",
      "url": "https://raw.githubusercontent.com/sushi-dev55/sushitools-games-repo/refs/heads/main/<appid>.zip",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    }
  ]
}

export default function Home() {
  const [gameId, setGameId] = useState('')
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [checkingDownload, setCheckingDownload] = useState(false)

  // Clear error when user starts typing
  useEffect(() => {
    if (error && gameId) {
      setError('')
    }
  }, [gameId, error])

  // Scroll to top when game data loads
  useEffect(() => {
    if (gameData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameData]);

  const fetchGameData = async () => {
    if (!gameId.trim()) {
      setError('Please enter a Steam Game ID')
      return
    }

    // Validate numeric ID
    if (isNaN(gameId)) {
      setError('Game ID must be a number')
      return
    }

    setLoading(true)
    setError('')
    setDownloadStatus(null)
    setGameData(null)
    
    try {
      const response = await fetch(`/api/steam-game?id=${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        setGameData(data.data)
      } else {
        setError(data.error || 'Failed to fetch game data. The game might not exist on Steam.')
        setGameData(null)
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      setGameData(null)
    } finally {
      setLoading(false)
    }
  }

  const checkDownloadAvailability = async () => {
    if (!gameId || !gameData) return

    setCheckingDownload(true)
    setDownloadStatus(null)

    try {
      const response = await fetch(`/api/check-download?appid=${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        setDownloadStatus(data.data)
      } else {
        setError('Failed to check download availability')
      }
    } catch (error) {
      console.error('Error checking download:', error)
      setError('Error checking download availability')
    } finally {
      setCheckingDownload(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchGameData()
  }

  const handleDownload = (downloadUrl) => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  // Popular Steam game IDs for reference
  const popularGames = [
    { id: '730', name: 'CS:GO' },
    { id: '570', name: 'Dota 2' },
    { id: '440', name: 'Team Fortress 2' },
    { id: '620', name: 'Portal 2' },
    { id: '400', name: 'Portal' },
    { id: '220', name: 'Half-Life 2' },
    { id: '10', name: 'Counter-Strike' },
    { id: '80', name: 'Counter-Strike: Condition Zero' },
    { id: '240', name: 'Counter-Strike: Source' },
    { id: '500', name: 'Left 4 Dead' }
  ]

  return (
    <div className="container">
      <Head>
        <title>Steam Game Info Finder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header title="Steam Game Information Finder" />
      
      <main className="main-content">
        <div className="search-section">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Steam Game ID (e.g., 730 for CS:GO)"
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? 'Loading...' : 'Get Game Info'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Popular Games Quick Access */}
          <div className="popular-games">
            <p>Try these popular games:</p>
            <div className="popular-games-list">
              {popularGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setGameId(game.id)
                    setTimeout(() => fetchGameData(), 100)
                  }}
                  className="popular-game-btn"
                >
                  {game.name} ({game.id})
                </button>
              ))}
            </div>
          </div>
        </div>

        {gameData && (
          <div className="game-info">
            {/* Title and Download Button */}
            <div className="game-title-section">
              <h1 className="game-title">{gameData.name}</h1>
              <button 
                onClick={checkDownloadAvailability}
                disabled={checkingDownload}
                className="download-check-button"
              >
                {checkingDownload ? 'Checking...' : 'Check Download'}
              </button>
            </div>
            
            {/* Download Status */}
            {downloadStatus && (
              <div className="download-status">
                <h3>Download Availability</h3>
                <div className="api-results">
                  {downloadStatus.map((result, index) => (
                    <div key={index} className={`api-result ${result.available ? 'available' : 'unavailable'}`}>
                      <div className="api-name">{result.name}</div>
                      <div className="api-status">
                        {result.available ? (
                          <span className="status-available">
                            ✅ Available 
                            <button 
                              onClick={() => handleDownload(result.directUrl)}
                              className="download-link"
                            >
                              Download
                            </button>
                          </span>
                        ) : (
                          <span className="status-unavailable">
                            ❌ {result.error || `Unavailable (Status: ${result.status})`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steam Header Picture */}
            {gameData.header_image && (
              <div className="steam-header-container">
                <img 
                  src={gameData.header_image} 
                  alt={gameData.name}
                  className="steam-header-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Game Info Section */}
            <div className="game-basic-info">
              <p><strong>Steam ID:</strong> {gameData.steam_appid}</p>
              <p><strong>Release Date:</strong> {gameData.release_date?.date || 'N/A'}</p>
              <p><strong>Developers:</strong> {gameData.developers?.join(', ') || 'N/A'}</p>
              <p><strong>Publishers:</strong> {gameData.publishers?.join(', ') || 'N/A'}</p>
              <p><strong>Price:</strong> {gameData.price_overview?.final_formatted || 'Free'}</p>
            </div>

            {/* Horizontal Game Pictures Roller */}
            {gameData.media?.screenshots && gameData.media.screenshots.length > 0 && (
              <div className="game-pictures-roller">
                <h2>Game Pictures</h2>
                <div className="roller-container">
                  {gameData.media.screenshots.map((screenshot, index) => (
                    <div key={index} className="roller-item">
                      <img 
                        src={screenshot.path_thumbnail || screenshot.path_full} 
                        alt={`Game ${index + 1}`}
                        className="roller-image"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Section */}
            {gameData.media && (
              <div className="media-section">
                <h2>Media</h2>
                
                {/* Videos */}
                {gameData.media.videos && gameData.media.videos.length > 0 && (
                  <div className="videos-section">
                    <h3>Videos</h3>
                    <div className="videos-grid">
                      {gameData.media.videos.map((video, index) => (
                        <div key={index} className="video-item">
                          <video 
                            controls 
                            poster={video.thumbnail}
                            className="game-video"
                          >
                            <source src={video.webm?.max || video.mp4?.max} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshots */}
                {gameData.media.screenshots && gameData.media.screenshots.length > 0 && (
                  <div className="screenshots-section">
                    <h3>Screenshots</h3>
                    <div className="screenshots-grid">
                      {gameData.media.screenshots.map((screenshot, index) => (
                        <img 
                          key={index}
                          src={screenshot.path_full} 
                          alt={`Screenshot ${index + 1}`}
                          className="screenshot"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="game-description">
              <h2>Description</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                className="description-content"
              />
            </div>

            {/* DLCs */}
            {gameData.dlcs && gameData.dlcs.length > 0 && (
              <div className="dlc-section">
                <h2>Downloadable Content (DLC)</h2>
                <div className="dlc-grid">
                  {gameData.dlcs.map((dlc) => (
                    <div key={dlc.id} className="dlc-item">
                      <h4>{dlc.name}</h4>
                      <p><strong>DLC ID:</strong> {dlc.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem 2rem;
        }

        .search-section {
          margin: 2rem 0;
          text-align: center;
          background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .search-form {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .search-input {
          padding: 1rem 1.25rem;
          font-size: 1.1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          min-width: 300px;
          max-width: 100%;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #fff;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }

        .search-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          border-color: #fff;
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .download-check-button {
          padding: 0.875rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .download-check-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }

        .download-check-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          color: #ff6b6b;
          margin: 1.5rem 0;
          font-weight: 600;
          padding: 1.25rem;
          background: #2d1b1b;
          border-left: 4px solid #dc3545;
          border-radius: 8px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          box-shadow: 0 2px 8px rgba(220,53,69,0.2);
        }

        .popular-games {
          margin: 2.5rem 0 0;
          padding: 1.5rem;
          background: rgba(22, 33, 62, 0.6);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .popular-games p {
          margin-bottom: 1rem;
          font-weight: 700;
          color: white;
          font-size: 1.1rem;
        }

        .popular-games-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .popular-game-btn {
          padding: 0.625rem 1.25rem;
          background: rgba(255,255,255,0.25);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .popular-game-btn:hover {
          background: rgba(255,255,255,0.35);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .game-info {
          width: 100%;
          padding: 2rem 0;
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .game-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .game-title {
          font-size: 2.5rem;
          color: #eee;
          margin: 0;
          word-wrap: break-word;
          font-weight: 700;
          line-height: 1.2;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .download-status {
          margin: 2rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .download-status h3 {
          color: #eee;
          margin-top: 0;
          font-size: 1.5rem;
        }

        .api-results {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .api-result {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .api-result.available {
          background: #1a3d2e;
          border-left-color: #28a745;
        }

        .api-result.unavailable {
          background: #3d1a1a;
          border-left-color: #dc3545;
        }

        .api-name {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .download-link {
          margin-left: 1rem;
          padding: 0.25rem 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .download-link:hover {
          background: #0056b3;
        }

        .status-available {
          color: #66ff99;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #ff6b6b;
        }

        .steam-header-container {
          margin: 2rem 0;
          text-align: center;
        }

        .steam-header-image {
          width: 100%;
          max-width: 900px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          transition: transform 0.3s ease;
        }

        .steam-header-image:hover {
          transform: scale(1.02);
        }

        .game-basic-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        .game-basic-info p {
          padding: 1rem;
          background: #16213e;
          border-radius: 12px;
          margin: 0;
          border-left: 3px solid #667eea;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .game-basic-info strong {
          color: #667eea;
        }

        .game-pictures-roller {
          margin: 3rem 0;
        }

        .game-pictures-roller h2 {
          color: #eee;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .roller-container {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 1rem 0;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #667eea #16213e;
        }

        .roller-container::-webkit-scrollbar {
          height: 8px;
        }

        .roller-container::-webkit-scrollbar-track {
          background: #16213e;
          border-radius: 10px;
        }

        .roller-container::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
        }

        .roller-container::-webkit-scrollbar-thumb:hover {
          background: #764ba2;
        }

        .roller-item {
          flex: 0 0 auto;
          width: 300px;
          height: 180px;
        }

        .roller-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .roller-image:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .game-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
          background: #16213e;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .game-description {
          margin: 2rem 0;
          padding: 2rem;
          background: #16213e;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .game-description h2 {
          color: #eee;
          margin-top: 0;
          font-size: 1.75rem;
        }

        .description-content {
          line-height: 1.6;
          overflow-wrap: break-word;
          color: #ccc;
        }

        .description-content :global(img) {
          max-width: 100%;
          height: auto;
        }

        .media-section {
          margin: 2rem 0;
        }

        .media-section h2, .media-section h3 {
          color: #eee;
        }

        .videos-grid, .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .game-video, .screenshot {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .screenshot:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .dlc-section {
          margin: 2rem 0;
        }

        .dlc-section h2 {
          color: #eee;
          font-size: 1.75rem;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .dlc-item {
          padding: 1.5rem;
          background: #16213e;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-left: 3px solid #667eea;
        }

        .dlc-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .dlc-item h4 {
          color: #eee;
          margin-top: 0;
        }

        .dlc-item p {
          color: #ccc;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 0 0.5rem 2rem;
          }

          .search-section {
            padding: 2rem 1rem;
            margin: 1rem 0;
          }

          .game-header {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }
          
          .search-form {
            flex-direction: column;
          }
          
          .search-input {
            min-width: auto;
            width: 100%;
            font-size: 1rem;
          }

          .search-button {
            width: 100%;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }

          .game-title-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .api-result {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .game-title {
            font-size: 1.75rem;
          }

          .game-description,
          .download-status {
            padding: 1.5rem;
          }

          .popular-games-list {
            gap: 0.4rem;
          }

          .popular-game-btn {
            font-size: 0.85rem;
            padding: 0.5rem 0.875rem;
          }

          .videos-grid, .screenshots-grid {
            grid-template-columns: 1fr;
          }
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          padding: 0;
        }

        :global(#__next) {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
      `}</style>
    </div>
  )
}
