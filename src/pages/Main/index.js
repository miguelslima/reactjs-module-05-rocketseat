import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';

import { Form, SubmitButton, List, ShowError, NoShowError } from './styles';

export default class Main extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
    ErrorMess: '',
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true, error: false });

    try {
      const { newRepo, repositories } = this.state;

      if (newRepo === '') {
        throw new Error('Repository cannot be empty');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const alreadyRepo = repositories.find(r => r.name === newRepo);

      if (alreadyRepo) {
        throw new Error('Repository already exists');
      }

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        ErrorMess: '',
      });
    } catch (Error) {
      this.setState(
        {
          error: true,
          ErrorMess:
            Error.message === 'Request failed with status code 404'
              ? 'Repository not found!'
              : Error.message,
        },
        () => {
          setTimeout(() => {
            this.setState({ ErrorMess: '' });
          }, 3000);
        }
      );
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, ErrorMess } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <p> Digite um repositório válido (ex.: Username/RepositoryName) </p>
        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder={ErrorMess}
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        {ErrorMess && (
          <ShowError>
            <small>{ErrorMess}</small>
          </ShowError>
        )}
        <NoShowError error={error}>
          <small />
        </NoShowError>

        <List>
          {repositories.map(repositoriy => (
            <li key={repositoriy.name}>
              <span>{repositoriy.name}</span>
              <Link to={`/repository/${encodeURIComponent(repositoriy.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
