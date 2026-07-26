import { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useInventory } from '../InvContext';
import { Field, InvCard, InvPage } from '../components/InvUI';

export default function Masters() {
  const { state, actions } = useInventory();
  const [product, setProduct] = useState({ id:'', name:'', category:state.categories[0]?.name||'', unit:'Piece', minStock:10, status:'Active' });
  const [category, setCategory] = useState({ name:'', prefix:'', description:'' });
  const [branch, setBranch] = useState({ id:'', name:'', type:'Branch', hubId:'801' });

  function saveP(e) {
    e.preventDefault();
    actions.saveProduct(product);
    setProduct({ id:'', name:'', category:state.categories[0]?.name||'', unit:'Piece', minStock:10, status:'Active' });
  }
  function saveC(e) {
    e.preventDefault();
    actions.saveCategory(category);
    setCategory({ name:'', prefix:'', description:'' });
  }
  function saveB(e) {
    e.preventDefault();
    actions.saveBranch(branch);
    setBranch({ id:'', name:'', type:'Branch', hubId:'801' });
  }

  return <InvPage title="Products & Master Data" subtitle="Maintain products, categories, units, minimum stock and branch/hub mapping.">
    <div className="inv-grid-two">
      <InvCard title="Add / Update Product"><form className="inv-form-grid" onSubmit={saveP}>
        <Field label="Item ID"><input required value={product.id} onChange={e=>setProduct({...product,id:e.target.value.toUpperCase()})} placeholder="PAP003"/></Field>
        <Field label="Item Name"><input required value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/></Field>
        <Field label="Category"><select value={product.category} onChange={e=>setProduct({...product,category:e.target.value})}>{state.categories.map(c=><option key={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Unit"><select value={product.unit} onChange={e=>setProduct({...product,unit:e.target.value})}>{['Piece','Box','Ream','Packet','Roll','Set'].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Minimum Stock"><input type="number" min="0" value={product.minStock} onChange={e=>setProduct({...product,minStock:Number(e.target.value)})}/></Field>
        <Field label="Status"><select value={product.status} onChange={e=>setProduct({...product,status:e.target.value})}><option>Active</option><option>Inactive</option></select></Field>
        <button className="inv-primary" type="submit"><Plus size={14}/> Save Product</button>
      </form></InvCard>

      <InvCard title="Add Category"><form className="inv-form-grid" onSubmit={saveC}>
        <Field label="Category Name"><input required value={category.name} onChange={e=>setCategory({...category,name:e.target.value})}/></Field>
        <Field label="ID Prefix"><input required maxLength="4" value={category.prefix} onChange={e=>setCategory({...category,prefix:e.target.value.toUpperCase()})}/></Field>
        <Field label="Description" full><textarea rows="4" value={category.description} onChange={e=>setCategory({...category,description:e.target.value})}/></Field>
        <button className="inv-primary" type="submit"><Plus size={14}/> Save Category</button>
      </form></InvCard>
    </div>

    <InvCard title="Add / Update Branch or Hub"><form className="inv-form-grid" onSubmit={saveB}>
      <Field label="Branch Code"><input required value={branch.id} onChange={e=>setBranch({...branch,id:e.target.value.replace(/\D/g,'')})} placeholder="804"/></Field>
      <Field label="Branch Name"><input required value={branch.name} onChange={e=>setBranch({...branch,name:e.target.value})}/></Field>
      <Field label="Type"><select value={branch.type} onChange={e=>setBranch({...branch,type:e.target.value})}><option>Branch</option><option>Hub</option><option>HQ</option></select></Field>
      <Field label="Parent Hub"><select value={branch.hubId} onChange={e=>setBranch({...branch,hubId:e.target.value})}><option value="">None</option>{state.branches.filter(b=>['HQ','Hub'].includes(b.type)).map(b=><option key={b.id} value={b.id}>{b.id} — {b.name}</option>)}</select></Field>
      <button className="inv-primary" type="submit"><Building2 size={14}/> Save Branch</button>
    </form></InvCard>

    <InvCard title="Product Catalogue"><div className="inv-table-wrap"><table className="inv-table"><thead><tr><th>Item ID</th><th>Item Name</th><th>Category</th><th>Unit</th><th>Min Stock</th><th>Status</th></tr></thead><tbody>{state.products.map(p=><tr key={p.id}><td><code>{p.id}</code></td><td>{p.name}</td><td>{p.category}</td><td>{p.unit}</td><td>{p.minStock}</td><td>{p.status}</td></tr>)}</tbody></table></div></InvCard>
    <div className="inv-grid-two">
      <InvCard title="Categories"><div className="inv-table-wrap"><table className="inv-table"><thead><tr><th>Name</th><th>Prefix</th><th>Description</th></tr></thead><tbody>{state.categories.map(c=><tr key={c.id}><td>{c.name}</td><td><code>{c.prefix}</code></td><td>{c.description}</td></tr>)}</tbody></table></div></InvCard>
      <InvCard title="Branches & Hubs"><div className="inv-table-wrap"><table className="inv-table"><thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Parent Hub</th></tr></thead><tbody>{state.branches.map(b=><tr key={b.id}><td><code>{b.id}</code></td><td>{b.name}</td><td>{b.type}</td><td>{b.hubId||'—'}</td></tr>)}</tbody></table></div></InvCard>
    </div>
  </InvPage>;
}
