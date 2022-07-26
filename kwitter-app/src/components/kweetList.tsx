import * as React from 'react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Kweet from './kweet/kweet';
import Rekweet from './kweet/rekweet'


const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

export default function KweetList(props: any) {

  let compare = (a: any, b: any) => {
    let a_time, b_time
    if ('rekweet_time' in a) {
      a_time = a.rekweet_time
    }
    else {
      a_time = a.post_time
    }
    if ('rekweet_time' in b) {
      b_time = b.rekweet_time
    }
    else {
      b_time = b.post_time
    }

    if (a_time > b_time) {
      return -1;
    }
    if (a_time < b_time) {
      return 1;
    }
    return 0;
  }

  if (props.list.length === 0) {
    return (
      <>
        No Kweets!
      </>
    );
  }

  props.list.sort(compare)

  return (
    <React.Fragment>
      <CssBaseline />
      <List sx={{ mb: 2 }}>
        {props.list.map((val: any, index: number) => (
          <React.Fragment key={index}>
            <ListItem sx={{ justifyContent: 'center'}}>
              {'rekweet_time' in val ?
                <Rekweet username={val.username} message={val.message}
                  post_time={val.post_time} rekweet_time={val.rekweet_time}
                  rekweet_username={val.rekweet_username} />
                :
                <Kweet username={val.username} message={val.message}
                  post_time={val.post_time} />
              }
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </React.Fragment>
  );
}