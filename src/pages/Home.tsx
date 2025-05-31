import Header from '../components/Header';
import Section from '../components/Section';
import '../styles/globals.css';

function Home() {
  return (
    <>
      <Header />
      <Section id="landing" title="Landing">
        <h1>Welcome to My Ceramics</h1>
      </Section>
      <Section id="about" title="About">
        <p>This is a little about me and my art.</p>
      </Section>
      <Section id="connections" title="Connections">
        <p>Find me on social media.</p>
      </Section>
    </>
  );
}

export default Home;
