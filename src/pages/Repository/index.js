import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Filter,
  Button,
  Navigation,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    state: 'open',
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);
    const { page } = this.state;
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 10,
          page,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async handleFilter(state) {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 10,
        page: 1,
      },
    });

    this.setState({ issues: response.data, page: 1, state });
  }

  async handlePage(type) {
    const { match } = this.props;
    const { state } = this.state;
    let { page } = this.state;
    if (type === 'next') {
      page += 1;
    } else {
      page = page === 1 ? 1 : page - 1;
    }
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 10,
        page,
      },
    });

    this.setState({ issues: response.data, page });
  }

  render() {
    const { repository, issues, loading, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <Button color="#7159c1" onClick={() => this.handleFilter('all')}>
            Todas
          </Button>
          <Button color="#F0AD4E" onClick={() => this.handleFilter('open')}>
            Abertas
          </Button>
          <Button
            color="#00C851
"
            onClick={() => this.handleFilter('closed')}
          >
            Fechadas
          </Button>
        </Filter>
        <Navigation>
          <button onClick={() => this.handlePage('prev')} disabled={page === 1}>
            <FaArrowAltCircleLeft size={22} color="#7159c1" />
          </button>
          <button onClick={() => this.handlePage('next')}>
            <FaArrowAltCircleRight size={22} color="#7159c1" />
          </button>
        </Navigation>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
