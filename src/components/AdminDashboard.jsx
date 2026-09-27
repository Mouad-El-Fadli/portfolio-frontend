import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API = 'https://mouad12.pythonanywhere.com';

// Helper : récupère le token stocké lors du login
const getToken = () => localStorage.getItem('adminToken') || '';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [cvMessage, setCvMessage] = useState('');

  // ── Project form state ──
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', link: '', image_url: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // ── Skill form state ──
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', icon: '', color: '#1bd3a1' });
  const [editingSkillId, setEditingSkillId] = useState(null);

  // ── Education form state ──
  const [eduForm, setEduForm] = useState({ year: '', city: '', degree: '', school: '', mention: '', order_index: 0 });
  const [editingEduId, setEditingEduId] = useState(null);

  // ── Experience form state ──
  const [expForm, setExpForm] = useState({ title: '', company: '', period: '', location: '', description: '', order_index: 0 });
  const [editingExpId, setEditingExpId] = useState(null);

  // ── Bio form state ──
  const [bioForm, setBioForm] = useState({ text1_fr: '', text2_fr: '' });
  const [bioMessage, setBioMessage] = useState('');

  // ── Credentials form state (username + password) ──
  const [credForm, setCredForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
  const [credMessage, setCredMessage] = useState({ text: '', isError: false });

  // ── Load data ──
  useEffect(() => {
    fetchProjects();
    fetchSkills();
    fetchEducation();
    fetchBio();
    fetchMessages();
    fetchExperiences();
    fetchCv();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${API}/api/projects`);
    const data = await res.json();
    setProjects(data);
  };

  const fetchSkills = async () => {
    const res = await fetch(`${API}/api/skills`);
    const data = await res.json();
    setSkills(data);
  };

  const fetchEducation = async () => {
    const res = await fetch(`${API}/api/education`);
    const data = await res.json();
    setEducation(data);
  };

  const fetchBio = async () => {
    const res = await fetch(`${API}/api/bio`);
    const data = await res.json();
    if (data.text1_fr) {
      setBioForm({ text1_fr: data.text1_fr, text2_fr: data.text2_fr });
    }
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API}/api/contact`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    await fetch(`${API}/api/contact/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchMessages();
  };

  const fetchExperiences = async () => {
    const res = await fetch(`${API}/api/experiences`);
    const data = await res.json();
    setExperiences(data);
  };

  const fetchCv = async () => {
    const res = await fetch(`${API}/api/cv`);
    const data = await res.json();
    if (data.exists) setCvUrl(data.url);
  };

  // ── Experience CRUD ──
  const handleExpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingExpId) {
        res = await fetch(`${API}/api/experiences/${editingExpId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(expForm)
        });
        if (res.ok) setEditingExpId(null);
      } else {
        res = await fetch(`${API}/api/experiences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(expForm)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erreur (${res.status}) : ${err.message || 'Opération échouée.'}`);
      } else {
        setExpForm({ title: '', company: '', period: '', location: '', description: '', order_index: 0 });
        await fetchExperiences();
      }
    } catch (err) {
      alert(`Erreur réseau : ${err.message}`);
    }
    setLoading(false);
  };

  const deleteExperience = async (id) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    await fetch(`${API}/api/experiences/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchExperiences();
  };

  const editExperience = (exp) => {
    setExpForm({ title: exp.title, company: exp.company, period: exp.period, location: exp.location || '', description: exp.description || '', order_index: exp.order_index || 0 });
    setEditingExpId(exp.id);
    setActiveTab('experience');
  };

  // ── CV Upload ──
  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Seuls les fichiers PDF sont acceptés.');
      return;
    }
    setLoading(true);
    setCvMessage('Upload en cours...');
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const res = await fetch(`${API}/api/upload-cv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCvUrl(data.url);
        setCvMessage('✅ CV mis à jour avec succès !');
      } else {
        setCvMessage(`❌ Erreur : ${data.error || 'Upload échoué'}`);
      }
    } catch (err) {
      setCvMessage(`❌ Erreur réseau : ${err.message}`);
    }
    setLoading(false);
    setTimeout(() => setCvMessage(''), 4000);
  };

  // ── Image Upload (mobile-safe) ──
  const handleImageUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation côté client avant envoi
    const MAX_SIZE_MB = 16;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    // NE PAS setter Content-Type manuellement — le navigateur gère le boundary multipart
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        // Pas de headers Content-Type ici (critique pour mobile)
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erreur upload : ${data.error || 'Inconnue'}`);
      } else if (formType === 'project') {
        setProjectForm(prev => ({ ...prev, image_url: data.url }));
      } else if (formType === 'skill') {
        setSkillForm(prev => ({ ...prev, icon: data.url }));
      }
    } catch (err) {
      alert(`Upload échoué : vérifiez votre connexion (${err.message})`);
    }
    setLoading(false);
  };

  // ── Projects CRUD ──
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingProjectId) {
        res = await fetch(`${API}/api/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(projectForm)
        });
        if (res.ok) setEditingProjectId(null);
      } else {
        res = await fetch(`${API}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(projectForm)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erreur (${res.status}) : ${err.message || 'Opération échouée. Vérifiez votre connexion.'}`);
      } else {
        setProjectForm({ title: '', description: '', technologies: '', link: '', image_url: '' });
        await fetchProjects();
      }
    } catch (err) {
      alert(`Erreur réseau : ${err.message}`);
    }
    setLoading(false);
  };


  const deleteProject = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    await fetch(`${API}/api/projects/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchProjects();
  };

  const editProject = (p) => {
    setProjectForm({ title: p.title, description: p.description, technologies: p.technologies, link: p.link || '', image_url: p.image_url || '' });
    setEditingProjectId(p.id);
    setActiveTab('projects');
  };

  // ── Skills CRUD ──
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingSkillId) {
        res = await fetch(`${API}/api/skills/${editingSkillId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(skillForm)
        });
        if (res.ok) setEditingSkillId(null);
      } else {
        res = await fetch(`${API}/api/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(skillForm)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erreur (${res.status}) : ${err.message || 'Impossible d\'ajouter le skill. Vérifiez votre connexion.'}`);
      } else {
        setSkillForm({ name: '', category: 'Frontend', icon: '', color: '#1bd3a1' });
        await fetchSkills();
      }
    } catch (err) {
      alert(`Erreur réseau : ${err.message}`);
    }
    setLoading(false);
  };

  const deleteSkill = async (id) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    await fetch(`${API}/api/skills/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchSkills();
  };

  const editSkill = (s) => {
    setSkillForm({ name: s.name, category: s.category || 'Frontend', icon: s.icon || '', color: s.color || '#1bd3a1' });
    setEditingSkillId(s.id);
    setActiveTab('skills');
  };

  // ── Education CRUD ──
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    if (editingEduId) {
      await fetch(`${API}/api/education/${editingEduId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(eduForm)
      });
      setEditingEduId(null);
    } else {
      await fetch(`${API}/api/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(eduForm)
      });
    }
    setEduForm({ year: '', city: '', degree: '', school: '', mention: '', order_index: 0 });
    fetchEducation();
  };

  const deleteEducation = async (id) => {
    if (!confirm('Supprimer cette formation ?')) return;
    await fetch(`${API}/api/education/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchEducation();
  };

  const editEducation = (e) => {
    setEduForm({ year: e.year, city: e.city, degree: e.degree, school: e.school, mention: e.mention || '', order_index: e.order_index || 0 });
    setEditingEduId(e.id);
    setActiveTab('education');
  };

  // ── Bio ──
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setBioMessage('Traduction en cours et sauvegarde...');
    const res = await fetch(`${API}/api/bio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(bioForm)
    });
    if (res.ok) {
      setBioMessage('Bio mise à jour avec succès et traduite en anglais !');
      setTimeout(() => setBioMessage(''), 3000);
    } else {
      setBioMessage('Erreur lors de la sauvegarde.');
    }
  };

  // ── Mise à jour des identifiants (username + password) ──
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setCredMessage({ text: '', isError: false });

    if (!credForm.newUsername && !credForm.newPassword) {
      setCredMessage({ text: 'Renseignez au moins un nouveau username ou mot de passe.', isError: true });
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      setCredMessage({ text: 'Les nouveaux mots de passe ne correspondent pas.', isError: true });
      return;
    }
    if (credForm.newPassword && credForm.newPassword.length < 8) {
      setCredMessage({ text: 'Le mot de passe doit contenir au moins 8 caractères.', isError: true });
      return;
    }

    try {
      const res = await fetch(`${API}/api/update-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`  // Token envoyé dans le header
        },
        body: JSON.stringify({
          currentPassword: credForm.currentPassword,
          newUsername: credForm.newUsername,
          newPassword: credForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCredMessage({ text: data.message, isError: false });
        // Logout automatique : le token a été invalidé côté serveur
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          window.location.href = '/';
        }, 2000);
      } else {
        setCredMessage({ text: data.message || 'Erreur serveur', isError: true });
      }
    } catch (err) {
      setCredMessage({ text: `Erreur réseau : ${err.message}`, isError: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <div className="admin-dashboard">
      {/* ── Sidebar ── */}
      <div className="admin-sidebar">
        <h2 className="admin-logo">⚡ Admin</h2>
        <ul>
          <li className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
            📁 Projects
          </li>
          <li className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>
            🛠 Skills
          </li>
          <li className={activeTab === 'education' ? 'active' : ''} onClick={() => setActiveTab('education')}>
            🎓 Education
          </li>
          <li className={activeTab === 'bio' ? 'active' : ''} onClick={() => setActiveTab('bio')}>
            📝 Bio
          </li>
          <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            ✉️ Messages
            {messages.length > 0 && <span style={{background: 'var(--accent)', color: '#000', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '8px'}}>{messages.length}</span>}
          </li>
          <li className={activeTab === 'experience' ? 'active' : ''} onClick={() => setActiveTab('experience')}>
            💼 Expérience
          </li>
          <li className={activeTab === 'cv' ? 'active' : ''} onClick={() => setActiveTab('cv')}>
            📄 Mon CV
          </li>
          <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
            🔒 Security
          </li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">⏻ Logout</button>
      </div>

      {/* ── Content ── */}
      <div className="admin-content">

        {/* ════════ MESSAGES TAB ════════ */}
        {activeTab === 'messages' && (
          <>
            <h1>Contact Messages</h1>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 && (
                    <tr><td colSpan={5} className="empty-row">No messages yet.</td></tr>
                  )}
                  {messages.map(m => (
                    <tr key={m.id}>
                      <td><small>{m.date}</small></td>
                      <td><strong>{m.name}</strong><br/><small>{m.phone}</small></td>
                      <td><a href={`mailto:${m.email}`} style={{color: 'var(--accent)'}}>{m.email}</a></td>
                      <td style={{whiteSpace: 'pre-wrap'}}>{m.message}</td>
                      <td className="action-cell">
                        <button className="btn-delete" onClick={() => deleteMessage(m.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ PROJECTS TAB ════════ */}
        {activeTab === 'projects' && (
          <>
            <h1>Manage Projects</h1>
            <form onSubmit={handleProjectSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Project title" required
                    value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Technologies</label>
                  <input type="text" placeholder="React, Flask, MySQL..."
                    value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} placeholder="Project description" required
                  value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Link (URL)</label>
                  <input type="text" placeholder="https://..."
                    value={projectForm.link} onChange={e => setProjectForm({...projectForm, link: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Image (URL or Upload)</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input type="text" placeholder="https://..." style={{flex: 1}}
                      value={projectForm.image_url} onChange={e => setProjectForm({...projectForm, image_url: e.target.value})} />
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'project')} style={{width: '200px'}} />
                  </div>
                  {loading && <span className="upload-status">Uploading...</span>}
                  {projectForm.image_url && <img src={projectForm.image_url} alt="preview" className="img-preview" style={{width: '100px', height: 'auto', marginTop: '10px'}} />}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingProjectId ? '✏ Update Project' : '+ Add Project'}
                </button>
                {editingProjectId && (
                  <button type="button" className="btn-cancel" onClick={() => { setEditingProjectId(null); setProjectForm({ title:'', description:'', technologies:'', link:'', image_url:'' }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Technologies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 && (
                    <tr><td colSpan={4} className="empty-row">No projects yet. Add one above!</td></tr>
                  )}
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.image_url ? <img src={p.image_url} alt={p.title} className="table-img" /> : <span className="no-img">—</span>}
                      </td>
                      <td><strong>{p.title}</strong><br/><small>{p.description?.substring(0,60)}...</small></td>
                      <td><span className="tech-tags">{p.technologies}</span></td>
                      <td className="action-cell">
                        <button className="btn-edit" onClick={() => editProject(p)}>✏</button>
                        <button className="btn-delete" onClick={() => deleteProject(p.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ SKILLS TAB ════════ */}
        {activeTab === 'skills' && (
          <>
            <h1>Manage Skills</h1>
            <form onSubmit={handleSkillSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Name</label>
                  <input type="text" placeholder="Python, React, etc." required
                    value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" placeholder="Langages, Frontend, Backend..." required
                    value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon (URL or Upload)</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input type="text" placeholder="https://..." style={{flex: 1}}
                      value={skillForm.icon} onChange={e => setSkillForm({...skillForm, icon: e.target.value})} />
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'skill')} style={{width: '200px'}} />
                  </div>
                  {skillForm.icon && <img src={skillForm.icon} alt="icon preview" className="img-preview" style={{width: '40px', height: '40px', objectFit: 'contain', background: '#333', padding: '4px'}} />}
                </div>
                <div className="form-group">
                  <label>Glow Color</label>
                  <input type="color" 
                    value={skillForm.color} onChange={e => setSkillForm({...skillForm, color: e.target.value})} 
                    style={{width: '100%', height: '42px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer'}} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingSkillId ? '✏ Update Skill' : '+ Add Skill'}
                </button>
                {editingSkillId && (
                  <button type="button" className="btn-cancel" onClick={() => { setEditingSkillId(null); setSkillForm({ name:'', category: 'Frontend', icon:'', color:'#1bd3a1' }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Skill</th>
                    <th>Category</th>
                    <th>Color</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.length === 0 && (
                    <tr><td colSpan={5} className="empty-row">No skills yet. Add one above!</td></tr>
                  )}
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td>
                        {s.icon ? <img src={s.icon} alt={s.name} style={{width: '32px', height: '32px', objectFit: 'contain'}} /> : <span className="no-img">—</span>}
                      </td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.category}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <div style={{width: '16px', height: '16px', borderRadius: '50%', background: s.color}}></div>
                          <small>{s.color}</small>
                        </div>
                      </td>
                      <td className="action-cell">
                        <button className="btn-edit" onClick={() => editSkill(s)}>✏</button>
                        <button className="btn-delete" onClick={() => deleteSkill(s.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ EDUCATION TAB ════════ */}
        {activeTab === 'education' && (
          <>
            <h1>Manage Education</h1>
            <form onSubmit={handleEduSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input type="text" placeholder="2026" required
                    value={eduForm.year} onChange={e => setEduForm({...eduForm, year: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="Salé" required
                    value={eduForm.city} onChange={e => setEduForm({...eduForm, city: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Degree / Diploma</label>
                <input type="text" placeholder="DUT Génie Informatique" required
                  value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>School / Institution</label>
                  <input type="text" placeholder="EST Salé" required
                    value={eduForm.school} onChange={e => setEduForm({...eduForm, school: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mention</label>
                  <input type="text" placeholder="Mention Bien"
                    value={eduForm.mention} onChange={e => setEduForm({...eduForm, mention: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Order (display order)</label>
                <input type="number" min="0" max="100"
                  value={eduForm.order_index} onChange={e => setEduForm({...eduForm, order_index: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingEduId ? '✏ Update Education' : '+ Add Education'}
                </button>
                {editingEduId && (
                  <button type="button" className="btn-cancel" onClick={() => { setEditingEduId(null); setEduForm({ year:'', city:'', degree:'', school:'', mention:'', order_index:0 }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Degree</th>
                    <th>School</th>
                    <th>City</th>
                    <th>Mention</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {education.length === 0 && (
                    <tr><td colSpan={6} className="empty-row">No education entries yet. Add one above!</td></tr>
                  )}
                  {education.map(e => (
                    <tr key={e.id}>
                      <td><strong className="edu-year">{e.year}</strong></td>
                      <td><strong>{e.degree}</strong></td>
                      <td>{e.school}</td>
                      <td>{e.city}</td>
                      <td><span className="mention-badge">{e.mention || '—'}</span></td>
                      <td className="action-cell">
                        <button className="btn-edit" onClick={() => editEducation(e)}>✏</button>
                        <button className="btn-delete" onClick={() => deleteEducation(e.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ BIO & PROFILE TAB ════════ */}
        {activeTab === 'bio' && (
          <>
            <h1>Manage Bio & Profile</h1>
            <form onSubmit={handleBioSubmit} className="admin-form">
              <h3>Text Content (À propos)</h3>
              <div className="form-group">
                <label>Paragraphe 1 (Cinématique) - En Français</label>
                <textarea rows={4} placeholder="Passionné par l'ingénierie..." required
                  value={bioForm.text1_fr} onChange={e => setBioForm({...bioForm, text1_fr: e.target.value})}></textarea>
                <small style={{color: 'var(--text)', display: 'block', marginTop: '4px'}}>La traduction anglaise et espagnole sera générée automatiquement lors de la sauvegarde.</small>
              </div>
              <div className="form-group">
                <label>Paragraphe 2 (Descriptif) - En Français</label>
                <textarea rows={4} placeholder="Maîtrisant les environnements..." required
                  value={bioForm.text2_fr} onChange={e => setBioForm({...bioForm, text2_fr: e.target.value})}></textarea>
              </div>
              
              {bioMessage && (
                <div style={{marginBottom: '16px', color: bioMessage.includes('Erreur') ? '#ff5555' : 'var(--accent)', fontSize: '14px', fontWeight: 'bold'}}>
                  {bioMessage}
                </div>
              )}
              
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  💾 Save & Translate
                </button>
              </div>
            </form>

            <form className="admin-form">
              <h3>Profile Image</h3>
              <div className="form-group">
                <label>Upload New Profile Picture</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  // Validation côté client
                  if (file.size > 16 * 1024 * 1024) {
                    alert(`Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 16 Mo.`);
                    return;
                  }

                  setLoading(true);
                  const formData = new FormData();
                  formData.append('image', file);
                  try {
                    // Pas de Content-Type header — laisser le navigateur gérer le boundary
                    const res = await fetch(`${API}/api/upload-profile`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData });
                    const data = await res.json();
                    if (res.ok) {
                      alert('Photo de profil mise à jour ! ✅\nLe changement sera visible après le rechargement de la page.');
                      // Met à jour l'image de profil dans l'app sans reload
                      window.dispatchEvent(new CustomEvent('profileImageUpdated', {
                        detail: { url: data.url, timestamp: data.timestamp }
                      }));
                    } else {
                      alert(`Erreur : ${data.error || 'Upload échoué'}`);
                    }
                  } catch (err) {
                    alert(`Upload échoué : ${err.message}`);
                  }
                  setLoading(false);
                }} />
                {loading && <span className="upload-status">Uploading...</span>}
              </div>
            </form>
          </>
        )}

        {/* ════════ SECURITY TAB ════════ */}
        {activeTab === 'security' && (
          <>
            <h1>Security Settings</h1>
            <p style={{color: 'var(--text)', marginBottom: '24px', fontSize: '14px'}}>
              ⚠️ Après modification, vous serez automatiquement déconnecté et devrez vous reconnecter avec les nouveaux identifiants.
            </p>
            <form onSubmit={handleCredentialsSubmit} className="admin-form" style={{maxWidth: '500px'}}>
              <div className="form-group">
                <label>Mot de passe actuel <span style={{color:'#ff5555'}}>*</span></label>
                <input type="password" required placeholder="Votre mot de passe actuel"
                  value={credForm.currentPassword}
                  onChange={e => setCredForm({...credForm, currentPassword: e.target.value})} />
              </div>
              <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0'}} />
              <div className="form-group">
                <label>Nouveau username <span style={{color:'var(--text)', fontSize:'12px'}}>(laisser vide pour ne pas changer)</span></label>
                <input type="text" placeholder="Nouveau username..."
                  value={credForm.newUsername}
                  onChange={e => setCredForm({...credForm, newUsername: e.target.value})}
                  autoComplete="username" />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe <span style={{color:'var(--text)', fontSize:'12px'}}>(min. 8 caractères, laisser vide pour ne pas changer)</span></label>
                <input type="password" placeholder="Nouveau mot de passe..."
                  value={credForm.newPassword}
                  onChange={e => setCredForm({...credForm, newPassword: e.target.value})}
                  autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input type="password" placeholder="Confirmer..."
                  value={credForm.confirmPassword}
                  onChange={e => setCredForm({...credForm, confirmPassword: e.target.value})}
                  autoComplete="new-password" />
              </div>

              {credMessage.text && (
                <div style={{
                  marginBottom: '16px',
                  color: credMessage.isError ? '#ff5555' : 'var(--accent)',
                  fontSize: '14px', fontWeight: 'bold',
                  padding: '10px', borderRadius: '8px',
                  background: credMessage.isError ? 'rgba(255,85,85,0.1)' : 'rgba(27,211,161,0.1)'
                }}>
                  {credMessage.isError ? '❌' : '✅'} {credMessage.text}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  🔒 Mettre à jour les identifiants
                </button>
              </div>
            </form>
          </>
        )}

        {/* ════════ EXPERIENCE TAB ════════ */}
        {activeTab === 'experience' && (
          <>
            <h1>Manage Experience</h1>
            <form onSubmit={handleExpSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Poste / Titre</label>
                  <input type="text" placeholder="ex: Développeur Front-End" required
                    value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Entreprise</label>
                  <input type="text" placeholder="ex: Entreprise XYZ" required
                    value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Période</label>
                  <input type="text" placeholder="ex: Jan 2023 - Déc 2023" required
                    value={expForm.period} onChange={e => setExpForm({...expForm, period: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ville / Lieu</label>
                  <input type="text" placeholder="ex: Casablanca"
                    value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Description (missions, tâches…)</label>
                <textarea rows={4} placeholder="- Développement de composants React&#10;- Intégration API REST..."
                  value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}></textarea>
              </div>
              <div className="form-group" style={{maxWidth: '150px'}}>
                <label>Ordre d'affichage</label>
                <input type="number" min="0"
                  value={expForm.order_index} onChange={e => setExpForm({...expForm, order_index: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {editingExpId ? '✏ Update Experience' : '+ Add Experience'}
                </button>
                {editingExpId && (
                  <button type="button" className="btn-cancel" onClick={() => { setEditingExpId(null); setExpForm({ title:'', company:'', period:'', location:'', description:'', order_index:0 }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Poste</th>
                    <th>Entreprise</th>
                    <th>Période</th>
                    <th>Lieu</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.length === 0 && (
                    <tr><td colSpan={5} className="empty-row">Aucune expérience. Ajouter ci-dessus !</td></tr>
                  )}
                  {experiences.map(exp => (
                    <tr key={exp.id}>
                      <td><strong>{exp.title}</strong></td>
                      <td>{exp.company}</td>
                      <td><small>{exp.period}</small></td>
                      <td><small>{exp.location}</small></td>
                      <td className="action-cell">
                        <button className="btn-edit" onClick={() => editExperience(exp)}>✏</button>
                        <button className="btn-delete" onClick={() => deleteExperience(exp.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ CV TAB ════════ */}
        {activeTab === 'cv' && (
          <>
            <h1>📄 Mon CV</h1>
            <div className="admin-form">
              <div className="form-group">
                <label style={{fontSize: '1rem', marginBottom: '12px', display: 'block'}}>
                  Upload ton CV (PDF) — Il sera téléchargeable par les visiteurs du portfolio
                </label>
                <input type="file" accept=".pdf" onChange={handleCvUpload}
                  style={{padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '100%'}} />
                {loading && <p style={{color: 'var(--accent)', marginTop: '10px'}}>⏳ Upload en cours...</p>}
                {cvMessage && (
                  <p style={{marginTop: '10px', padding: '10px', borderRadius: '8px',
                    background: cvMessage.startsWith('✅') ? 'rgba(27,211,161,0.1)' : 'rgba(255,85,85,0.1)',
                    color: cvMessage.startsWith('✅') ? 'var(--accent)' : '#ff5555'}}>
                    {cvMessage}
                  </p>
                )}
              </div>

              {cvUrl && (
                <div style={{marginTop: '24px', padding: '20px', background: 'rgba(27,211,161,0.05)', border: '1px solid var(--accent)', borderRadius: '12px'}}>
                  <p style={{marginBottom: '16px', color: '#aaa'}}>✅ CV actuel disponible :</p>
                  <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <a href={cvUrl} target="_blank" rel="noopener noreferrer"
                      style={{background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700'}}>
                      👁 Voir le CV
                    </a>
                    <a href={cvUrl} download="CV_Mouad_El_Fadli.pdf"
                      style={{background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none'}}>
                      ⬇ Télécharger
                    </a>
                  </div>
                  <p style={{marginTop: '12px', fontSize: '12px', color: '#666', wordBreak: 'break-all'}}>{cvUrl}</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
