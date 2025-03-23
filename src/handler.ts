import { APIGatewayEvent, Context } from 'aws-lambda'
import axios from 'axios'

const GOOGLE_PLACES_API_KEY = 'TEST_API_KEY'

export const lambdaHandler = async (event: APIGatewayEvent, context: Context) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API Key' }),
    }
  }

  const pathParameters = event.pathParameters || {}
  const queryStringParameters = event.queryStringParameters || {}

  if (pathParameters.PLACEID) {
    return fetchPlaceDetails(GOOGLE_PLACES_API_KEY, pathParameters.PLACEID)
  } else if (event.resource === '/places/searchText') {
    const query = queryStringParameters.query
    return searchPlacesByText(GOOGLE_PLACES_API_KEY, query)
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Invalid request' }),
  }
}

const fetchPlaceDetails = async (apiKey: string, placeId: string) => {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
  try {
    const response = await axios.get(url, { params: { place_id: placeId, key: apiKey } })
    return formatResponse(response.data)
  } catch (error) {
    return handleError(error)
  }
}

const searchPlacesByText = async (apiKey: string, query?: string) => {
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Query parameter is required' }) }
  }

  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
  try {
    const response = await axios.get(url, { params: { query, key: apiKey } })
    return formatResponse(response.data)
  } catch (error) {
    return handleError(error)
  }
}

const formatResponse = (data: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}

const handleError = (error: any) => {
  return {
    statusCode: error.response?.status || 500,
    body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
  }
}
