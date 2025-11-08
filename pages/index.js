import Head from 'next/head'
import { useState } from 'react'
import Header from '@components/Header'
import Footer from '@components/Footer'

// API configuration
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

  const fetchGameData = async () => {
    if (!gameId.trim()) {
      setError('Please enter a Steam Game ID')
      return
    }

    setLoading(true)
    setError('')
    setDownloadStatus(null)
    
    try {
      const response = await fetch(`/api/steam-game?id=${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        setGameData(data.data)
      } else {
        setError(data.error || 'Failed to fetch game data')
        setGameData(null)
      }
    } catch (err) {
      setError('Error fetching game data')
      setGameData(null)
    } finally {
      setLoading(false)
    }
  }

  const checkDownloadAvailability = async () => {
    if (!gameId || !gameData) return

    setCheckingDownload(true)
    setDownloadStatus(null)

    const results = []

    for (const api of apiConfig.api_list) {
      if (!api.enabled) continue

      try {
        const url = api.url.replace('<appid>', gameId)
        const response = await fetch(url, { method: 'HEAD' })
        
        results.push({
          name: api.name,
          url: url,
          available: response.status === api.success_code,
          status: response.status,
          directUrl: response.status === api.success_code ? url : null
        })
      } catch (error) {
        results.push({
          name: api.name,
          url: api.url.replace('<appid>', gameId),
          available: false,
          status: 'Error',
          error: error.message
        })
      }
    }

    setDownloadStatus(results)
    setCheckingDownload(false)
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

  return (
    <div className="container">
      <Head>
        <title>Steam Game Info Finder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Steam Game Information Finder" />
        
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
          
          {error && <div className="error-message">{error}</div>}
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
                            ❌ Unavailable (Status: {result.status})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Header with Picture and Basic Info */}
            <div className="game-header">
              <img 
                src={gameData.header_image} 
                alt={gameData.name}
                className="game-header-image"
              />
              
              <div className="game-basic-info">
                <p><strong>Steam ID:</strong> {gameData.steam_appid}</p>
                <p><strong>Release Date:</strong> {gameData.release_date?.date || 'N/A'}</p>
                <p><strong>Developers:</strong> {gameData.developers?.join(', ') || 'N/A'}</p>
                <p><strong>Publishers:</strong> {gameData.publishers?.join(', ') || 'N/A'}</p>
                <p><strong>Price:</strong> {gameData.price_overview?.final_formatted || 'Free'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="game-description">
              <h2>Description</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                className="description-content"
              />
            </div>

            {/* Media Showcase */}
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
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
          padding: 0 0.5rem;
        }

        .search-section {
          margin: 2rem 0;
          text-align: center;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input {
          padding: 0.75rem;
          font-size: 1rem;
          border: 2px solid #0070f3;
          border-radius: 4px;
          min-width: 300px;
        }

        .search-button, .download-check-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .search-button:hover:not(:disabled),
        .download-check-button:hover:not(:disabled) {
          background-color: #0051a8;
        }

        .search-button:disabled,
        .download-check-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff0000;
          margin-top: 1rem;
          font-weight: bold;
        }

        .game-info {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 0;
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
          color: #333;
          margin: 0;
        }

        .download-check-button {
          background-color: #28a745;
        }

        .download-check-button:hover:not(:disabled) {
          background-color: #218838;
        }

        .download-status {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
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
          background: #d4edda;
          border-left-color: #28a745;
        }

        .api-result.unavailable {
          background: #f8d7da;
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
          color: #155724;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #721c24;
        }

        .game-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .game-header-image {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .game-basic-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 1.1rem;
        }

        .game-description {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .description-content {
          line-height: 1.6;
        }

        .description-content :global(img) {
          max-width: 100%;
          height: auto;
        }

        .media-section {
          margin: 2rem 0;
        }

        .videos-grid, .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .game-video, .screenshot {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dlc-section {
          margin: 2rem 0;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .dlc-item {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        @media (max-width: 768px) {
          .game-header {
            grid-template-columns: 1fr;
          }
          
          .search-form {
            flex-direction: column;
          }
          
          .search-input {
            min-width: auto;
            width: 100%;
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
        }
      `}</style>
    </div>
  )
}
