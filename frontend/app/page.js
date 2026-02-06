import styles from './page.module.css';

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Latest News</h1>
      <p>Content loading...</p>
      {/* Example News Grid Placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
         {[1,2,3,4,5,6].map(i => (
           <div key={i} style={{ border: '1px solid #ddd', padding: '10px', height: '200px', background: '#f9f9f9' }}>
              News Item {i}
           </div>
         ))}
      </div>
    </div>
  );
}
