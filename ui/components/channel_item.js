import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import {
  Button,
  ButtonGroup,
  Panel,
  Badge,
} from 'react-bootstrap';

import Image from './image';
import Icon from './icon';
import { sanitize } from './utils';

function ChannelItem(props) {
  const { channel, subscribe, isLoggedIn } = props;
  const url = `/channel/${channel.id}/`;

  const counterBadge = channel.numPodcasts ? <Badge>{channel.numPodcasts}</Badge> : '';

  return (
    <Panel>
    <div className="media">
      <div className="media-left">
        <Link to={url}>
        <Image className="media-object"
          src={channel.image}
          errSrc="/static/podcast.png"
          imgProps={{
            height: 60,
            width: 60,
            alt: channel.title }}
        />
        </Link>
      </div>
      <div className="media-body">
        <h4 className="media-heading">
          <Link to={url}>{channel.title}</Link> {counterBadge}
            </h4>
        </div>
    </div>
    {isLoggedIn ?
    <ButtonGroup style={{ marginTop: 20 }}>
      <Button title={channel.isSubscribed ?
        'Unsubscribe' : 'Subscribe'} onClick={subscribe}
      >
        <Icon icon={channel.isSubscribed ? 'unlink' : 'link'} /> {
        channel.isSubscribed ? 'Unsubscribe' : 'Subscribe'
        }
      </Button>
    </ButtonGroup>
    : ''}
    <p
      style={{ marginTop: 20 }}
      dangerouslySetInnerHTML={sanitize(channel.description)}
    />
</Panel>
  );
}

ChannelItem.propTypes = {
  channel: PropTypes.object.isRequired,
  subscribe: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default ChannelItem;
