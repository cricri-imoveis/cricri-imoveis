export default function Home() {
  return (
    <main style={{fontFamily:"Inter,sans-serif",background:"#F0EDE6",minHeight:"100vh",color:"#0F1923"}}>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.25rem 2rem",borderBottom:"1px solid rgba(15,25,35,0.1)"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700}}>Cricri <span style={{color:"#C8A96E"}}>Imoveis</span></div>
        <a href="/busca" style={{background:"#0F1923",color:"#F0EDE6",padding:"9px 20px",borderRadius:8,textDecoration:"none",fontSize:14,fontWeight:500}}>Consultar imoveis</a>
      </nav>
      <section style={{maxWidth:800,margin:"0 auto",padding:"5rem 2rem",textAlign:"center"}}>
        <p style={{fontSize:12,fontWeight:600,letterSpacing:2,color:"#C8A96E",textTransform:"uppercase",marginBottom:16}}>A reputacao do imovel que voce merece saber</p>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:52,fontWeight:700,lineHeight:1.1,marginBottom:24}}>Quem morou la sabe a verdade.</h1>
        <p style={{fontSize:18,lineHeight:1.75,color:"#5C6670",margin:"0 auto 40px",maxWidth:520}}>Ex-moradores avaliam imoveis onde viveram. Voce acessa essas notas antes de assinar qualquer contrato.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/avaliar" style={{background:"#0F1923",color:"#F0EDE6",padding:"14px 28px",borderRadius:8,textDecoration:"none",fontSize:15,fontWeight:600}}>Avaliar um imovel</a>
          <a href="/busca" style={{background:"transparent",color:"#0F1923",border:"1.5px solid rgba(15,25,35,0.2)",padding:"14px 28px",borderRadius:8,textDecoration:"none",fontSize:15,fontWeight:500}}>Consultar avaliacoes</a>
        </div>
      </section>
      <footer style={{padding:"2rem",textAlign:"center",fontSize:13,color:"#9BA3AB"}}>2026 Cricri Imoveis</footer>
    </main>
  )
}
