import React, { useEffect, Component } from "react";
import { Container } from "semantic-ui-react";
import axios from "axios";
import io from "socket.io-client";

import TableUser from "../TableUser/TableUser";
import ModalUser from "../ModalUser/ModalUser";

import "./App.css";

class App extends Component {
  constructor() {
    super();

    // this.server = process.env.REACT_APP_API_URL || '';
    // REACT_APP_API_URL=
    // this.server = "http://127.0.0.1:3000" || "";
    this.server = `https://backendapi-88g7.onrender.com` || "";
    this.socket = io.connect(this.server);

    this.state = {
      users: [],
      online: 0,
    };

    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleUserAdded = this.handleUserAdded.bind(this);
    this.handleUserUpdated = this.handleUserUpdated.bind(this);
    this.handleUserDeleted = this.handleUserDeleted.bind(this);
  }

  // Place socket.io code inside here
  componentDidMount() {
    this.fetchUsers();
    this.socket.on("visitor enters", (data) => this.setState({ online: data }));
    this.socket.on("visitor exits", (data) => this.setState({ online: data }));
    this.socket.on("add", (data) => this.handleUserAdded(data));
    this.socket.on("update", (data) => this.handleUserUpdated(data));
    this.socket.on("delete", (data) => this.handleUserDeleted(data));
  }

  // Fetch data from the back-end
  fetchUsers() {
    axios
      .get(`${this.server}/api/users/`)
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleUserAdded(user) {
    let users = this.state.users.slice();
    users.push(user);
    this.setState({ users: users });
  }

  handleUserUpdated(user) {
    let users = this.state.users.slice();

    let i = users.findIndex((u) => u._id === user._id);

    if (users.length > i) {
      users[i] = user;
    }

    this.setState({ users: users });
  }

  handleUserDeleted(user) {
    let users = this.state.users.slice();
    users = users.filter((u) => {
      return u._id !== user._id;
    });
    this.setState({ users: users });
  }

  render() {
    let peopleOnline = this.state.online - 1;
    let onlineText = "";

    if (peopleOnline < 1) {
      onlineText = "Everyone is offline.";
    } else {
      onlineText =
        peopleOnline > 1
          ? `${this.state.online - 1} people are online`
          : `${this.state.online - 1} person is online`;
    }

    return (
      <div>
        <div className="App">
          <div className="App-header">
            <h1 className="App-intro">CRUD APP</h1>
          </div>
        </div>
        <Container>
          <ModalUser
            headerTitle="Add User"
            buttonTriggerTitle="Add New"
            buttonSubmitTitle="Add"
            buttonColor="pink"
            onUserAdded={this.handleUserAdded}
            server={this.server}
            socket={this.socket}
          />
          <em id="online">{onlineText}</em>
          <div className="tableUser">
            <TableUser
              onUserUpdated={this.handleUserUpdated}
              onUserDeleted={this.handleUserDeleted}
              users={this.state.users}
              server={this.server}
              socket={this.socket}
            />
          </div>
        </Container>
        <br />
      </div>
    );
  }
}

export default App;
