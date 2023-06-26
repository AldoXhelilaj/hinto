import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loader from './images/loader.svg';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [totalPosts, setTotalPosts] = useState(100);
  const [noPosts, setNoPosts] = useState(false)

  const bottomOfPageRef = useRef(null);

  const callbackFunction = (entries) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  const debounce = (func, delay) => {
    let timeoutId;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const fetchPosts = useCallback(debounce(async (start = 0, limit = 10) => {

    try {
      setLoading(true);
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_start=${start}&_limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Error fetching posts');
      }
      const totalCount = response.headers.get('x-total-count');
      setTotalPosts(parseInt(totalCount));
      const data = await response.json();

      if (data.length === 0) {
        setLoading(false);
        setNoPosts(true);
        return;
      }

      setPosts((prevPosts) => [...prevPosts, ...data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  }, 500), []);

  const options = useMemo(() => ({
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }), []);


  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);

    if (bottomOfPageRef.current) observer.observe(bottomOfPageRef.current);
    if (isVisible) {

      const start = posts.length;
      fetchPosts(start)
    }

  }, [bottomOfPageRef, fetchPosts, isVisible, options, posts.length, totalPosts]);



  const handleModalShow = (post) => {
    setModalData(post);
  };

  const handleModalClose = () => {
    setModalData({});
  };

  return (
    <Container>
      <h1 className='mb-5'>Posts</h1>
      <Row>
        {posts.map((post) => (
          <Col key={post.id} sm={4} >
            <div className="post">
              <h5>{post.title}</h5>
              <Button size="sm" variant="link" onClick={() => handleModalShow(post)}>
                Read More
              </Button>
            </div>
          </Col>
        ))}
      </Row>
      {noPosts && (
        <Row className="text-center">
          <Col md={12}><h5>No more Posts to show</h5></Col>
        </Row>
      )}

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <img src={Loader} alt="loader" />
        </div>
      )}
      <div ref={bottomOfPageRef} style={{ paddingTop: '50px' }}></div>
      <Modal show={Boolean(modalData.id)} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalData.body}</Modal.Body>
      </Modal>
    </Container>
  );
}

export default App;
