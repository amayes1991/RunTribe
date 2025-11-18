# Google Maps API Integration Setup

This guide will help you set up Google Maps API integration to display run locations on interactive maps in your RunTribe application.

## Prerequisites

- A Google Cloud Platform account
- A billing account set up (Google Maps API requires billing to be enabled)

## Step 1: Enable Google Maps APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** - For displaying interactive maps
   - **Geocoding API** - For converting addresses to coordinates
   - **Places API** (optional) - For enhanced location search

### To enable APIs:
1. Navigate to "APIs & Services" > "Library"
2. Search for each API by name
3. Click on the API and press "Enable"

## Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Restrict the API key for security:
   - Click on the API key you just created
   - Under "Application restrictions", select "HTTP referrers (websites)"
   - Add your domain(s) (e.g., `localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key" and choose the APIs you enabled

## Step 3: Configure Environment Variables

1. In your `runtribe` directory, create a `.env.local` file (if it doesn't exist)
2. Add your Google Maps API key:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

**Note**: The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to a group page with scheduled runs
3. You should see interactive maps displaying the location of each run

## Features

The Google Maps integration provides:

- **Interactive Maps**: Each run location is displayed on a Google Map
- **Automatic Geocoding**: Address strings are automatically converted to map coordinates
- **Responsive Design**: Maps adapt to different screen sizes
- **Error Handling**: Graceful fallbacks when locations can't be found or API is unavailable
- **Loading States**: Visual feedback while maps are loading

## Customization

You can customize the map appearance by modifying the `GoogleMapComponent`:

- **Map Style**: Modify the `options` prop in the GoogleMap component
- **Zoom Level**: Change the default `zoom` prop (currently set to 15)
- **Map Size**: Adjust the `height` and `width` props when using the component
- **Map Controls**: Enable/disable various map controls in the options

## Troubleshooting

### Common Issues:

1. **"Google Maps API key not configured"**
   - Ensure your `.env.local` file exists and contains the correct API key
   - Restart your development server after adding environment variables

2. **"Location not found"**
   - Check that the location string is valid and specific enough
   - Verify the Geocoding API is enabled in your Google Cloud Console

3. **"Failed to load location"**
   - Check your browser's network tab for API request errors
   - Verify your API key restrictions allow requests from your domain

4. **Maps not loading**
   - Check browser console for JavaScript errors
   - Verify the Maps JavaScript API is enabled
   - Ensure your API key has the correct restrictions

### API Quotas and Limits:

- **Geocoding API**: 2,500 free requests per day
- **Maps JavaScript API**: 28,500 free map loads per month
- Monitor usage in Google Cloud Console > "APIs & Services" > "Dashboard"

## Security Best Practices

1. **Restrict API Keys**: Always restrict your API keys to specific domains and APIs
2. **Monitor Usage**: Regularly check your API usage in Google Cloud Console
3. **Set Budget Alerts**: Configure billing alerts to avoid unexpected charges
4. **Use Environment Variables**: Never hardcode API keys in your source code

## Production Deployment

When deploying to production:

1. Update your environment variables with production API keys
2. Ensure your production domain is added to API key restrictions
3. Consider implementing rate limiting for map requests
4. Monitor API usage and costs

## Support

For Google Maps API support:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

For RunTribe-specific issues, check the main project documentation or create an issue in the project repository.




