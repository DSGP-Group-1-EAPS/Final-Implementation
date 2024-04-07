import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';

const teamMembers = [
  {
    name: "John Doe",
    role: "CEO",
    bio: "John is passionate about leading the company to success and ensuring that our vision is realized.",
    image: 'https://drive.usercontent.google.com/download?id=1H4dW3xeIf3-OUaQ3u8aS5cs6SHBS9QUB&export=view&authuser=0', // Replace with the actual image file name or URL
  },
  {
    name: "Jane Smith",
    role: "CTO",
    bio: "Jane oversees the technical direction of our projects and ensures that our technology stack remains cutting-edge.",
    image: "./kavindu.jpg", // Replace with the actual image file name or URL
  },
  {
    name: "Alice Johnson",
    role: "Marketing Director",
    bio: "Alice is responsible for crafting and executing our marketing strategies to reach our target audience effectively.",
    image: "./sandun.jpg", // Replace with the actual image file name or URL
  },
  {
    name: "Bob Thompson",
    role: "Lead Developer",
    bio: "Bob leads our development team, guiding them to create robust and scalable solutions for our clients.",
    image: "./thedin.jpg", // Replace with the actual image file name or URL
  },
];

const AboutUsPage = () => {
  return (
    <Container>
      <Typography variant="h2" gutterBottom align="center">
        Our Team
      </Typography>
      <Grid container spacing={3}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper style={{ padding: '20px', textAlign: 'center' }}>
              <img src={member.image} alt={member.name} style={{ width: '100%', borderRadius: '50%', marginBottom: '20px' }} />
              <Typography variant="h5" gutterBottom>
                {member.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {member.role}
              </Typography>
              <Typography variant="body1">
                {member.bio}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutUsPage;
