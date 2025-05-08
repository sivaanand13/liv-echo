import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';

export default function PostCard({ item: post }) {
    if (!post) {
        return <div>No post data available</div>;
    }
    return (
        <Card sx={{ width: '100%', minWidth: '33vw', display: 'flex', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'center' }}>
            <CardHeader sx={{ marginTop: '5vh' }} title={<Typography variant="h4">{post.senderUsername}</Typography>} />
            <CardContent sx={{ paddingLeft: '2em', paddingRight: '2em', textAlign: 'left' }}>
                <Typography variant="body1">{post.text}</Typography>
            </CardContent>
        </Card>
  );
}
