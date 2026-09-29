'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, SELECT } from '../../../lib/supabase'
import Card from '../../../components/Card'

const MS = [
  [1e3, '1K'],
  [1e4, '10K'],
  [1e5, '100K'],
  [1e6, '1M'],
  [1e7, '10M']
]

export default function Profile() {
  const { username } = useParams()
  const r = useRouter()

  const [pr, setPr] = useState(null)
  const [photos, setPhotos] = useState([])
  const [me, setMe] = useState(null)
  const [fc, setFc] = useState(0)
  const [fol, setFol] = useState(false)
  const [miss, setMiss] = useState(false)
  const [loadingPhotos, setLoadingPhotos] = useState(true)

  const load = useCallback(async () => {
    // Get profile
    const { data: p, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError || !p) {
      console.error('Profile error:', profileError)
      setMiss(true)
      return
    }

    setPr(p)

    // Get photos
    setLoadingPhotos(true)

    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .select(SELECT)
      .eq('owner', p.id)
      .order('views', { ascending: false })

    if (photoError) {
      console.error('Photos error:', photoError)
      setPhotos([])
    } else {
      console.log('Photos loaded:', photoData)

      // Make sure every photo has a usable URL
      const processedPhotos = (photoData || []).map(photo => {
        let imageUrl = photo.url

        // If database doesn't already contain a URL,
        // create one from Supabase Storage path.
        if (!imageUrl && photo.path) {
          const { data } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.path)

          imageUrl = data?.publicUrl || null
        }

        return {
          ...photo,
          url: imageUrl
        }
      })

      console.log('Processed photos:', processedPhotos)

      setPhotos(processedPhotos)
    }

    setLoadingPhotos(false)

    // Followers
    const { count, error: followCountError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following', p.id)

    if (followCountError) {
      console.error('Follower count error:', followCountError)
    }

    setFc(count || 0)

    // Current user
    const {
      data: { user }
    } = await supabase.auth.getUser()

    setMe(user)

    // Check following
    if (user) {
      const { data: f, error: followingError } = await supabase
        .from('follows')
        .select('follower')
        .eq('follower', user.id)
        .eq('following', p.id)

      if (followingError) {
        console.error('Following error:', followingError)
      }

      setFol(!!f?.length)
    }
  }, [username])

  useEffect(() => {
    load()
  }, [load])

  if (miss) {
    return <p>Photographer not found.</p>
  }

  if (!pr) {
    return <p className="mu">Loading…</p>
  }

  const v = photos.reduce(
    (s, x) => s + (x.views || 0),
    0
  )

  const l = photos.reduce(
    (s, x) => s + (x.likes?.[0]?.count ?? 0),
    0
  )

  const d = photos.reduce(
    (s, x) => s + (x.downloads || 0),
    0
  )

  const own = me?.id === pr.id
  const next = MS.find(m => v < m[0])

  async function follow() {
    if (!me) {
      return r.push('/login')
    }

    if (fol) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower', me.id)
        .eq('following', pr.id)
    } else {
      await supabase
        .from('follows')
        .insert({
          follower: me.id,
          following: pr.id
        })
    }

    load()
  }

  async function del(p) {
    if (!confirm('Delete this photo?')) return

    // Delete file from Supabase Storage
    if (p.path) {
      const { error: storageError } = await supabase
        .storage
        .from('photos')
        .remove([p.path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', p.id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return
    }

    load()
  }

  return (
    <>
      <div
        className="row"
        style={{ alignItems: 'center' }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 34 }}>
            {pr.full_name}
          </h1>

          <div className="mu">
            @{pr.username}
          </div>
        </div>

        {!own && (
          <button
            className={`b ${fol ? '' : 'p'}`}
            onClick={follow}
          >
            {fol ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div
        className="row"
        style={{ marginTop: 16 }}
      >
        <div className="st">
          <b>{v.toLocaleString()}</b>
          Total views
        </div>

        <div className="st">
          <b>{l}</b>
          Likes
        </div>

        <div className="st">
          <b>{d}</b>
          Downloads
        </div>

        <div className="st">
          <b>{fc}</b>
          Followers
        </div>
      </div>

      <p className="mu">
        {MS.filter(m => v >= m[0])
          .map(m => `🏆 ${m[1]} views`)
          .join('  ') || 'No milestones yet.'}

        {next
          ? `  ·  ${(next[0] - v).toLocaleString()} views to ${next[1]}`
          : ''}
      </p>

      <h2>
        Gallery ({photos.length})
      </h2>

      {loadingPhotos ? (
        <p className="mu">Loading photos…</p>
      ) : photos.length === 0 ? (
        <p className="mu">
          No photos uploaded yet.
        </p>
      ) : (
        <div className="mas">
          {photos.map(p => (
            <Card
              key={p.id}
              p={p}
              onDelete={own ? del : null}
            />
          ))}
        </div>
      )}
    </>
  )
}
