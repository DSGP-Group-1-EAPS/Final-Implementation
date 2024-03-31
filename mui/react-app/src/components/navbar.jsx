import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { deepOrange, deepPurple } from '@mui/material/colors';
import Homebody from './homebody';
import InputFileUpload from './upload';
import Badge from '@mui/material/Badge';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';






export default function TemporaryDrawer() {



    const [open, setOpen] = React.useState(false);

    const theme = createTheme({
        typography: {
          fontFamily: [
            'Roboto',
            'sans-serif',
          ].join(','),
        },
      });

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ background: 'black', color: 'white', padding: '10px' }} // Set background and text color

            >
                <Box>
                   
                </Box>
                <Box>
                    <h1 style={{ fontFamily: 'Arial', color: 'white' }}>E A P S</h1>
                </Box>
                <div>
                    <Stack
                        spacing={4}
                        direction="row"
                        alignItems="center"
                        marginRight="12px">
                        
                           
                        
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>S</Avatar>
                    </Stack>

                </div>


            </Stack>
            <Homebody />






        </div>
    );
}
