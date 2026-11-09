import { useState, useEffect } from 'react'
import {
  Droplets,
  Wind,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  CloudLightning
} from 'lucide-react'

interface WeatherData {
  city: string
  country: string
  temperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
}

function App() {

  const [cityInput, setCityInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather(cityInput)
  }

  useEffect(() => {
    fetchWeather('Manila')
  }, [])

  const [weather, setWeather] = useState<WeatherData | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found.')
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`)

      const weatherData = await weatherRes.json()

      setWeather({
        city: name,
        country: country,
        temperature: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
      })

    }

    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeather(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-amber-50 text-white flex items-center justify-center'>
      <div className='w-full max-w-md space-y-6'>

        {/* Header */}
        <h1 className='text-3xl font-black text-center text-sky-400'>Weather Forecast </h1>

        {/* Search */}
        <form onSubmit={handleSearch} className='flex gap-2'>
          <input type='text' placeholder='Enter City' value={cityInput} onChange={(e) => setCityInput(e.target.value)} className='flex-1 p-2 rounded-lg text-amber-950 bg-slate-50 border-2 border-amber-400 outline-none' />

          <button type='submit' disabled={isLoading} className='px-6 bg-sky-400 hover:bg-sky-600 text-white border-amber-400 rounded-lg cursor-pointer'>{isLoading ? 'Searching...' : 'Search'}</button>
        </form>

        {/* Error */}
        {error && <p className='text-red-500 text-center'>{error}</p>}

        {/* Weather Card */}
        {weather && (() => {
          const { label, icon: WeatherIcon } = getWeatherInfo(weather.weatherCode)

          return (

            < div className='flex flex-col gap-4 p-6 bg-slate-800/80 rounded-2xl border border-slate-200 text-center'>

              <div className='flex justify-between text-left items-center'>
                <div className='flex flex-col'>
                  <h2 className='text-xl'>{weather.city}, {weather.country}</h2>
                  <p className=' flex gap-2 items-center text-sm text-slate-400'><WeatherIcon className='w-6 h-6' />
                    {label}
                  </p>
                </div>
                <div className='flex text-6xl font-black '>
                  {weather.temperature}°C
                </div>
              </div>



              {/* Weather Details */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col items-center bg-slate-900/50 p-3 rounded-xl'>
                  <Droplets className="w-6 h-6" />
                  <span className="text-xs text-slate-400 block">Humidity</span>
                  <span className="text-lg font-bold">{weather.humidity}%</span>
                </div>
                <div className='flex flex-col items-center bg-slate-900/50 p-3 rounded-xl'>
                  <Wind className="w-6 h-6" />
                  <span className="text-xs text-slate-400 block">Wind Speed</span>
                  <span className="text-lg font-bold">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          )
        })()}


      </div>
    </div >
  )


}

function getWeatherInfo(code: number) {
  switch (code) {
    case 0:
      return { label: 'Sunny', icon: Sun }
    case 1:
    case 2:
    case 3:
      return { label: 'Mostly Clear', icon: CloudSun }
    case 45:
    case 48:
      return { label: 'Foggy', icon: CloudFog }
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: CloudDrizzle }
    case 61:
    case 63:
    case 65:
      return { label: 'Raining', icon: CloudRain }
    case 71:
    case 73:
    case 75:
      return { label: 'Snowing', icon: CloudSnow }
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: CloudRain }
    case 95:
      return { label: 'Thunderstorm', icon: CloudLightning }
    default:
      return { label: 'Cloudy', icon: Cloud }
  }
}

export default App
