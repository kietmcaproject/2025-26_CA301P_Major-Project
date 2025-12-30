import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'

const StatsCard = React.memo(({ title, value, icon: Icon, color, description }) => {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Icon sx={{ fontSize: 60, color, mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 'bold', color, fontSize: '3rem' }}>
          {value}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.2rem', fontWeight: '600' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = 'StatsCard'

export default StatsCard
