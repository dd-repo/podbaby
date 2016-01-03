import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import 'bootswatch/paper/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

import {
  Nav,
  NavItem,
  Navbar,
  Badge,
  Alert,
  Grid,
  Row,
  Col
} from 'react-bootstrap';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { pushPath } from 'redux-simple-router';

import * as actions from '../actions';
import Icon from './icon';
import AddChannelModal from './add_channel';

class MainNav extends React.Component {

  render() {

    const { auth } = this.props;
    const { createHref, isActive } = this.props.history;

    return (
      <Navbar fixedTop={true}>
        <Navbar.Header>
          <Navbar.Brand>
            <Link style={{ fontFamily: "GoodDog" }} to="/podcasts/new/"><Icon icon="headphones" /> PodBaby</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav pullLeft>
            <NavItem active={isActive("/podcasts/search/")}
              href={createHref("/podcasts/search/")}><Icon icon="search" /> Discover</NavItem>
            <NavItem active={isActive("/podcasts/new/")}
                     href={createHref("/podcasts/new/")}><Icon icon="flash" /> New episodes</NavItem>
            <NavItem active={isActive("/podcasts/subscriptions/")}
                     href={createHref("/podcasts/subscriptions/")}><Icon icon="list" /> Subscriptions</NavItem>
            <NavItem active={isActive("/podcasts/bookmarks/")}
                     href={createHref("/podcasts/bookmarks/")}><Icon icon="bookmark" /> Bookmarks</NavItem>
            <NavItem onClick={this.props.onOpenAddChannelForm} href="#"><Icon icon="plus" /> Add new</NavItem>
          </Nav>

          <Nav pullRight>
            <NavItem active={isActive("/user/")}
                      href={createHref("/user/")}><Icon icon="cog" /> {auth.name}</NavItem>
            <NavItem href="#" onClick={this.props.onLogout}><Icon icon="sign-out" /> Logout</NavItem>
          </Nav>
        </Navbar.Collapse>

      </Navbar>
    );
  }
}


export class Player extends React.Component {
  handleClose(event) {
    event.preventDefault();
    this.props.onClosePlayer();
  }

  render() {
    const { podcast } = this.props.player;
    return (
      <footer style={{
        position:"fixed",
        padding: "5px",
        opacity: 0.8,
        backgroundColor: "#222",
        color: "#fff",
        fontWeight: "bold",
        height: "50px",
        bottom: 0,
        width: "100%",
        zIndex: 100
        }}>
        <Grid>
          <Row>
            <Col xs={6} md={6}>
              Currently playing: <b><Link to={`/podcasts/channel/${podcast.channelId}/`}>{podcast.name}</Link> : {podcast.title}</b>
            </Col>
            <Col xs={3} md={4}>
              <audio controls={true} autoPlay={true} src={podcast.enclosureUrl}>
                <source src={podcast.enclosureUrl} />
                Download from <a href="#">here</a>.
              </audio>
            </Col>
            <Col xs={3} md={2} mdPush={2}>
              <a href="#" onClick={this.handleClose.bind(this)} style={{ color: "#fff" }}><Icon icon="remove" /> Close</a>
            </Col>
          </Row>
        </Grid>
    </footer>
    );
  }
}


const AlertList = props => {

  if (props.alerts.length === 0) return <div></div>;

  return (
    <div className="container" style={{
        position: "fixed",
        height: "50px",
        width: "100%",
        bottom: 20,
        zIndex: 200
      }}>
      {props.alerts.map(alert => {
        const dismissAlert = () => props.onDismissAlert(alert.id);
        return (<Alert key={alert.id} bsStyle={alert.status} onDismiss={dismissAlert} dismissAfter={3000}>
          <p>{alert.message}</p>
        </Alert>);
      })}
    </div>
  );
};

export class App extends React.Component {

  constructor(props) {
    super(props);
    const { dispatch } = this.props;

    this.actions = {
      auth: bindActionCreators(actions.auth, dispatch),
      addChannel: bindActionCreators(actions.addChannel, dispatch),
      search: bindActionCreators(actions.search, dispatch),
      player: bindActionCreators(actions.player, dispatch),
      alerts: bindActionCreators(actions.alerts, dispatch)
    }
  }

  handleLogout(event) {
    event.preventDefault();
    this.actions.auth.logout();
  }

  handleOpenAddChannelForm(event) {
    event.preventDefault();
    this.actions.addChannel.open();
  }

  handleCloseAddChannelForm(event) {
    event.preventDefault();
    this.actions.addChannel.close();
  }

  handleAddChannel(url) {
    this.actions.addChannel.add(url);
  }

  handleDismissAlert(id) {
    this.actions.alerts.dismissAlert(id);
  }

  handleClosePlayer() {
    this.actions.player.setPodcast(null);
  }

  render() {

    const { createHref } = this.props.history;
    const { isLoggedIn } = this.props.auth;

    const pageContent = (
        <div className="container">
          {this.props.children}
        </div>
    );

    const alertList = (
        <AlertList alerts={this.props.alerts}
                   onDismissAlert={this.handleDismissAlert.bind(this)} />
    );
    if (isLoggedIn) {
      return (
        <div>
          <MainNav onLogout={this.handleLogout.bind(this)}
                   onOpenAddChannelForm={this.handleOpenAddChannelForm.bind(this)}
                   {...this.props} />
          {pageContent}
          {this.props.player.isPlaying ?
            <Player player={this.props.player}
                    createHref={createHref}
                    onClosePlayer={this.handleClosePlayer.bind(this)}/> : ''}

          {alertList}
          <AddChannelModal {...this.props.addChannel}
                           container={this}
                           onAdd={this.handleAddChannel.bind(this)}
                           onClose={this.handleCloseAddChannelForm.bind(this)} />
        </div>
      );
    } else {
      return (
        <div>
          {pageContent}
          {alertList}
        </div>
      );
    }
  }
}


App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  routing: PropTypes.object.isRequired,
  auth: PropTypes.object,
  addChannel: PropTypes.object,
  player: PropTypes.object,
  alerts: PropTypes.array
};


const mapStateToProps = state => {
  const { routing, auth, addChannel, player, alerts } = state;
  return {
    routing,
    auth,
    addChannel,
    player,
    alerts
  };
};

export default connect(mapStateToProps)(App);
