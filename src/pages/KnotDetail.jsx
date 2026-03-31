import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Loader2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  useKnot, 
  useVoteKnotMutation, 
  useAddSolutionMutation,
  useMarkSolutionCorrectMutation,
  useVoteSolutionMutation 
} from '../hooks/useKnotHooks';
import KnotDetailSkeleton from '../components/skeletons/KnotDetailSkeleton';
import { format } from 'date-fns';

// Helper to format distances in words (simplified version)
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export default function KnotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const { data: knot, isLoading, isError } = useKnot(id);
  const { mutate: upvote, isPending: upvoting } = useVoteKnotMutation();
  const { mutate: addSolution, isPending: submitting } = useAddSolutionMutation();
  const { mutate: markCorrect, isPending: marking } = useMarkSolutionCorrectMutation();
  const { mutate: voteSolution, isPending: votingSolution } = useVoteSolutionMutation();
  const [insight, setInsight] = useState('');

  if (isLoading) return <KnotDetailSkeleton />;

  if (isError || !knot) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Problem Not Found</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
          The knot you are looking for doesn't exist or has been moved to the archive.
        </p>
        <Link to="/" className="btn-primary">Return to Archive</Link>
      </div>
    );
  }

  const upvoters = knot.upvoters || [];
  const isUpvoted = user && upvoters.includes(user._id);

  const handleUpvote = (e) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    upvote(knot._id);
  };

  const handleSubmitInsight = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (!insight.trim()) return;

    addSolution({ knotId: id, content: insight }, {
      onSuccess: () => {
        setInsight('');
      }
    });
  };

  return (
    <div className="container" style={{ paddingBottom: 'var(--spacing-12)' }}>
      {/* Editorial Header & Title */}
      <header style={{ maxWidth: '800px', margin: 'var(--spacing-8) auto 2rem auto', textAlign: 'center' }}>
        <Link to="/" className="label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.1em', transition: 'color 0.2s', textDecoration: 'none' }}>
          ← {knot.category || 'Architecture & Design'}
        </Link>
        <h1 style={{ fontSize: 'var(--text-display-h1)', lineHeight: 1.15, marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          {knot.title}
        </h1>
        
        {/* Author Metabar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          marginTop: '1rem', 
          borderTop: '1px solid var(--surface-variant)', 
          borderBottom: '1px solid var(--surface-variant)', 
          padding: '1.5rem 0' 
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={knot.author?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=48&h=48'} 
                alt={knot.author?.name} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{knot.author?.name || 'Anonymous'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    {formatTime(knot.createdAt)}
                  </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <button 
                 onClick={handleUpvote}
                 className={isUpvoted ? "btn-primary" : "filter-pill"} 
                 style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '0.5rem', 
                   padding: '0.5rem 1rem',
                   cursor: upvoting ? 'wait' : 'pointer',
                   backgroundColor: isUpvoted ? 'var(--primary)' : 'transparent',
                   color: isUpvoted ? 'var(--on-primary)' : 'inherit'
                 }}
               >
                 <ThumbsUp size={16} strokeWidth={isUpvoted ? 3 : 2} /> 
                 {upvoters.length}
               </button>
               <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}><Share2 size={18} /></button>
               <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <article style={{ maxWidth: '800px', margin: '0 auto var(--spacing-12)' }}>
        
        <div style={{ fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '2rem', color: 'var(--on-surface)', whiteSpace: 'pre-wrap' }}>
          {knot.content}
        </div>
        
        {/* Contextual Image */}
        {knot.image && (
          <figure style={{ margin: '3rem 0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
             <img 
               src={knot.image} 
               alt={knot.title} 
               style={{ width: '100%', height: 'auto', display: 'block' }} 
             />
             <figcaption style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '0.75rem' }}>
               {knot.title} Visualization
             </figcaption>
          </figure>
        )}
      </article>

      {/* Solutions / Comments Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto', borderTop: '2px solid var(--surface-variant)', paddingTop: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem' }}>
          <MessageSquare size={24} color="var(--primary)" />
          Community Solutions ({knot.solutions?.length || 0})
        </h3>
        
        {/* Render Solutions List */}
        {knot.solutions && knot.solutions.length > 0 ? (
          knot.solutions.map((solution, index) => {
            const isCorrect = solution.isCorrect;
            const isAuthor = user && (knot.author?._id === user._id || knot.author === user._id);

            return (
              <div 
                key={solution._id || index} 
                className="section-soft" 
                style={{ 
                  position: 'relative', 
                  marginBottom: '1.5rem',
                  border: isCorrect ? '2px solid var(--primary)' : '1px solid var(--surface-variant)',
                  backgroundColor: isCorrect ? 'rgba(var(--primary-rgb), 0.03)' : 'inherit',
                  transition: 'all 0.3s ease'
                }}
              >
                 {isCorrect && (
                   <div style={{ 
                     position: 'absolute', 
                     top: '0', 
                     right: '2rem', 
                     transform: 'translateY(-50%)',
                     backgroundColor: 'var(--primary)',
                     color: 'white',
                     padding: '0.25rem 0.75rem',
                     borderRadius: 'var(--radius-full)',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.4rem',
                     fontSize: '0.7rem',
                     fontWeight: 700,
                     letterSpacing: '0.05em',
                     boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                   }}>
                     <ShieldCheck size={14} />
                     VERIFIED SOLUTION
                   </div>
                 )}

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <img 
                         src={solution.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=40&h=40'} 
                         alt={solution.user?.name} 
                         style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                       />
                       <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{solution.user?.name || 'Contributor'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{formatTime(solution.createdAt)}</div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       {isAuthor && (
                         <button 
                           onClick={() => markCorrect({ knotId: id, solutionId: solution._id })}
                           disabled={marking}
                           style={{ 
                             background: 'none', 
                             border: 'none', 
                             cursor: 'pointer',
                             color: isCorrect ? 'var(--primary)' : 'var(--on-surface-variant)',
                             display: 'flex',
                             flexDirection: 'column',
                             alignItems: 'center',
                             padding: '0.2rem',
                             transition: 'all 0.2s ease',
                             opacity: solution.isCorrect || !marking ? 1 : 0.5
                           }}
                           title={isCorrect ? "Remove Verification" : "Mark as Correct Solution"}
                         >
                           <CheckCircle2 
                             size={22} 
                             fill={isCorrect ? 'var(--primary)' : 'none'} 
                             strokeWidth={isCorrect ? 2.5 : 2}
                           />
                           <span style={{ fontSize: '0.6rem', marginTop: '0.2rem', fontWeight: 700 }}>
                             {isCorrect ? 'UNMARK' : 'VERIFY'}
                           </span>
                         </button>
                       )}
                       <button 
                         onClick={() => {
                           if (!user) {
                             openLoginModal();
                             return;
                           }
                           voteSolution({ knotId: id, solutionId: solution._id });
                         }}
                         disabled={votingSolution}
                         style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: '0.25rem', 
                           background: 'none', 
                           border: 'none', 
                           color: solution.upvoters?.includes(user?._id) ? 'var(--primary)' : 'var(--on-surface-variant)', 
                           fontSize: '0.9rem', 
                           cursor: 'pointer', 
                           fontWeight: 600,
                           transition: 'all 0.2s ease'
                         }}
                         title={solution.upvoters?.includes(user?._id) ? "Remove vote" : "Upvote this insight"}
                       >
                          <ThumbsUp 
                            size={16} 
                            fill={solution.upvoters?.includes(user?._id) ? 'var(--primary)' : 'none'}
                            strokeWidth={solution.upvoters?.includes(user?._id) ? 2.5 : 2}
                          /> 
                          {solution.upvoters?.length || 0}
                       </button>
                    </div>
                 </div>
                 
                 <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                   {solution.content}
                 </p>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--on-surface-variant)' }}>
            No insights shared yet. Be the first to contribute!
          </div>
        )}

        {/* Propose Solution Box */}
        <div className="card-lifted" style={{ marginTop: '3rem' }}>
           <h4 className="label-caps" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Propose a Solution</h4>
           
           {!user ? (
             <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-default)', backgroundColor: 'var(--surface-container-low)' }}>
               <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>You must be part of the archive to propose solutions.</p>
               <button onClick={() => openLoginModal()} className="btn-secondary">
                 Login to Contribute
               </button>
             </div>
           ) : (
             <>
               <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                 <textarea 
                   rows="4" 
                   value={insight}
                   onChange={(e) => setInsight(e.target.value)}
                   placeholder={`Share an insight as ${user.name}...`}
                   style={{ backgroundColor: 'var(--surface-container-low)' }}
                 ></textarea>
               </div>
               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <button 
                     className="btn-primary" 
                     style={{ padding: '0.75rem 2rem' }}
                     onClick={handleSubmitInsight}
                     disabled={submitting || !insight.trim()}
                   >
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Insight'}
                   </button>
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
